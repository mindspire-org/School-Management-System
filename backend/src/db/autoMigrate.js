import { query } from '../config/db.js';

export async function ensureStudentExtendedColumns() {
  // Normalize column names and ensure JSONB columns exist
  await query(`
    DO $$
    BEGIN
      -- Rename common misnamed columns to expected snake_case
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='rollnumber') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN rollnumber TO roll_number';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='rfidtag') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN rfidtag TO rfid_tag';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='feestatus') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN feestatus TO fee_status';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='busnumber') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN busnumber TO bus_number';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='busassigned') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN busassigned TO bus_assigned';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='parentname') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN parentname TO parent_name';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='parentphone') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN parentphone TO parent_phone';
      END IF;
      -- Some schemas might have "date" or "admissiondate" instead of admission_date
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='admissiondate')
         AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='admission_date') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN admissiondate TO admission_date';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='date')
         AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='admission_date') THEN
        EXECUTE 'ALTER TABLE students RENAME COLUMN date TO admission_date';
      END IF;
    END $$;

    ALTER TABLE students
      ADD COLUMN IF NOT EXISTS personal JSONB,
      ADD COLUMN IF NOT EXISTS academic JSONB,
      ADD COLUMN IF NOT EXISTS parent JSONB,
      ADD COLUMN IF NOT EXISTS transport JSONB,
      ADD COLUMN IF NOT EXISTS fee JSONB;

    -- Ensure JSONB columns are not null and have '{}' default
    UPDATE students SET personal='{}'::jsonb WHERE personal IS NULL;
    UPDATE students SET academic='{}'::jsonb WHERE academic IS NULL;
    UPDATE students SET parent='{}'::jsonb WHERE parent IS NULL;
    UPDATE students SET transport='{}'::jsonb WHERE transport IS NULL;
    UPDATE students SET fee='{}'::jsonb WHERE fee IS NULL;

    ALTER TABLE students
      ALTER COLUMN personal SET DEFAULT '{}'::jsonb,
      ALTER COLUMN academic SET DEFAULT '{}'::jsonb,
      ALTER COLUMN parent SET DEFAULT '{}'::jsonb,
      ALTER COLUMN transport SET DEFAULT '{}'::jsonb,
      ALTER COLUMN fee SET DEFAULT '{}'::jsonb;

    ALTER TABLE students
      ALTER COLUMN personal SET NOT NULL,
      ALTER COLUMN academic SET NOT NULL,
      ALTER COLUMN parent SET NOT NULL,
      ALTER COLUMN transport SET NOT NULL,
      ALTER COLUMN fee SET NOT NULL;
  `);
}

export async function ensureAssignmentsSchema() {
  await query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='subject') THEN
          EXECUTE 'ALTER TABLE assignments ADD COLUMN subject TEXT';
        END IF;
      END IF;
    END $$;
  `);
}

export async function ensureLibrarySchema() {
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'library_books'
      ) THEN
        EXECUTE '
          CREATE TABLE library_books (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT,
            subject TEXT,
            pages INTEGER,
            campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        ';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'library_issues'
      ) THEN
        EXECUTE '
          CREATE TABLE library_issues (
            id SERIAL PRIMARY KEY,
            book_id INTEGER NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
            student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            issued_on DATE NOT NULL DEFAULT CURRENT_DATE,
            due_on DATE NOT NULL,
            returned_on DATE,
            status TEXT NOT NULL DEFAULT ''issued'' CHECK (status IN (''issued'',''returned'')),
            campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        ';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_library_issues_student ON library_issues(student_id)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_library_issues_status ON library_issues(status)';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'library_fines'
      ) THEN
        EXECUTE '
          CREATE TABLE library_fines (
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            issue_id INTEGER REFERENCES library_issues(id) ON DELETE SET NULL,
            fine_type TEXT NOT NULL DEFAULT ''late'' CHECK (fine_type IN (''late'',''damage'',''lost'')),
            amount NUMERIC(12,2) NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT ''unpaid'' CHECK (status IN (''unpaid'',''paid'')),
            fine_date DATE NOT NULL DEFAULT CURRENT_DATE,
            details TEXT,
            campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        ';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_library_fines_student ON library_fines(student_id)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_library_fines_status ON library_fines(status)';
      END IF;
    END $$;
  `);
}

export async function ensurePayrollSchema() {
  await query(`
    ALTER TABLE teacher_payrolls
      ADD COLUMN IF NOT EXISTS bank_name TEXT,
      ADD COLUMN IF NOT EXISTS account_title TEXT,
      ADD COLUMN IF NOT EXISTS account_number TEXT,
      ADD COLUMN IF NOT EXISTS iban TEXT,
      ADD COLUMN IF NOT EXISTS cheque_number TEXT;

    ALTER TABLE driver_payrolls
      ADD COLUMN IF NOT EXISTS bank_name TEXT,
      ADD COLUMN IF NOT EXISTS account_title TEXT,
      ADD COLUMN IF NOT EXISTS account_number TEXT,
      ADD COLUMN IF NOT EXISTS iban TEXT,
      ADD COLUMN IF NOT EXISTS cheque_number TEXT;
  `);
}

export async function ensureCardManagementSchema() {
  await query(`
    ALTER TABLE admit_card_templates
      ADD COLUMN IF NOT EXISTS exam_name TEXT;
  `);
}

export async function ensureCertificatesSchema() {
  await query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificate_templates') THEN
        ALTER TABLE certificate_templates
          ADD COLUMN IF NOT EXISTS show_border BOOLEAN DEFAULT TRUE,
          ADD COLUMN IF NOT EXISTS border_color TEXT DEFAULT '#111111',
          ADD COLUMN IF NOT EXISTS border_width INTEGER DEFAULT 2,
          ADD COLUMN IF NOT EXISTS border_style TEXT DEFAULT 'solid',
          ADD COLUMN IF NOT EXISTS border_radius INTEGER DEFAULT 14,
          ADD COLUMN IF NOT EXISTS background_image_url TEXT,
          ADD COLUMN IF NOT EXISTS background_image_opacity NUMERIC(5,2) DEFAULT 0.20,
          ADD COLUMN IF NOT EXISTS watermark_text TEXT,
          ADD COLUMN IF NOT EXISTS watermark_image_url TEXT,
          ADD COLUMN IF NOT EXISTS watermark_opacity NUMERIC(5,2) DEFAULT 0.08,
          ADD COLUMN IF NOT EXISTS watermark_rotate INTEGER DEFAULT -25,
          ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Georgia, serif',
          ADD COLUMN IF NOT EXISTS title_font_family TEXT DEFAULT 'Georgia, serif',
          ADD COLUMN IF NOT EXISTS title_font_size INTEGER DEFAULT 34,
          ADD COLUMN IF NOT EXISTS body_font_size INTEGER DEFAULT 18,
          ADD COLUMN IF NOT EXISTS footer_font_size INTEGER DEFAULT 14,
          ADD COLUMN IF NOT EXISTS signature1_name TEXT,
          ADD COLUMN IF NOT EXISTS signature1_title TEXT,
          ADD COLUMN IF NOT EXISTS signature1_image_url TEXT,
          ADD COLUMN IF NOT EXISTS signature2_name TEXT,
          ADD COLUMN IF NOT EXISTS signature2_title TEXT,
          ADD COLUMN IF NOT EXISTS signature2_image_url TEXT,
          ADD COLUMN IF NOT EXISTS show_serial BOOLEAN DEFAULT TRUE,
          ADD COLUMN IF NOT EXISTS serial_prefix TEXT DEFAULT 'CERT-',
          ADD COLUMN IF NOT EXISTS serial_padding INTEGER DEFAULT 6;
      END IF;
    END $$;
  `);
}

export async function ensureMasterDataSchema() {
  await query(`
    DO $$
    DECLARE
      default_campus_id INTEGER;
    BEGIN
      SELECT id INTO default_campus_id FROM campuses LIMIT 1;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'designations'
      ) THEN
        EXECUTE '
          CREATE TABLE designations (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            department TEXT,
            campus_id INTEGER REFERENCES campuses(id) ON DELETE CASCADE,
            is_shared BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        ';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'fee_structures'
      ) THEN
        EXECUTE '
          CREATE TABLE fee_structures (
            id SERIAL PRIMARY KEY,
            fee_type TEXT NOT NULL,
            amount NUMERIC(12,2) NOT NULL DEFAULT 0,
            frequency TEXT NOT NULL DEFAULT ''Monthly'',
            class_id INTEGER,
            campus_id INTEGER REFERENCES campuses(id) ON DELETE CASCADE,
            is_shared BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        ';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'departments'
      ) THEN
        EXECUTE '
          CREATE TABLE departments (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT,
            campus_id INTEGER REFERENCES campuses(id) ON DELETE CASCADE,
            is_shared BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        ';
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='category') THEN
          EXECUTE 'ALTER TABLE subjects ADD COLUMN category TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='is_shared') THEN
          EXECUTE 'ALTER TABLE subjects ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT FALSE';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='campus_id') THEN
          EXECUTE 'ALTER TABLE subjects ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE CASCADE';
        END IF;
        IF default_campus_id IS NOT NULL THEN
          EXECUTE 'UPDATE subjects SET campus_id = ' || default_campus_id || ' WHERE campus_id IS NULL';
          BEGIN
            EXECUTE 'ALTER TABLE subjects ALTER COLUMN campus_id SET DEFAULT ' || default_campus_id;
          EXCEPTION WHEN others THEN
            NULL;
          END;
          BEGIN
            EXECUTE 'ALTER TABLE subjects ALTER COLUMN campus_id SET NOT NULL';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_subjects_campus_id ON subjects(campus_id)';
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'designations') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='designations' AND column_name='campus_id') THEN
          EXECUTE 'ALTER TABLE designations ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE CASCADE';
        END IF;
        IF default_campus_id IS NOT NULL THEN
          EXECUTE 'UPDATE designations SET campus_id = ' || default_campus_id || ' WHERE campus_id IS NULL';
          BEGIN
            EXECUTE 'ALTER TABLE designations ALTER COLUMN campus_id SET DEFAULT ' || default_campus_id;
          EXCEPTION WHEN others THEN
            NULL;
          END;
          BEGIN
            EXECUTE 'ALTER TABLE designations ALTER COLUMN campus_id SET NOT NULL';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_designations_campus_id ON designations(campus_id)';
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fee_structures') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fee_structures' AND column_name='campus_id') THEN
          EXECUTE 'ALTER TABLE fee_structures ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE CASCADE';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fee_structures' AND column_name='is_shared') THEN
          EXECUTE 'ALTER TABLE fee_structures ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT FALSE';
        END IF;
        IF default_campus_id IS NOT NULL THEN
          EXECUTE 'UPDATE fee_structures SET campus_id = ' || default_campus_id || ' WHERE campus_id IS NULL';
          BEGIN
            EXECUTE 'ALTER TABLE fee_structures ALTER COLUMN campus_id SET DEFAULT ' || default_campus_id;
          EXCEPTION WHEN others THEN
            NULL;
          END;
          BEGIN
            EXECUTE 'ALTER TABLE fee_structures ALTER COLUMN campus_id SET NOT NULL';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_fee_structures_campus_id ON fee_structures(campus_id)';
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departments') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='campus_id') THEN
          EXECUTE 'ALTER TABLE departments ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE CASCADE';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='is_shared') THEN
          EXECUTE 'ALTER TABLE departments ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT FALSE';
        END IF;
        IF default_campus_id IS NOT NULL THEN
          EXECUTE 'UPDATE departments SET campus_id = ' || default_campus_id || ' WHERE campus_id IS NULL';
          BEGIN
            EXECUTE 'ALTER TABLE departments ALTER COLUMN campus_id SET DEFAULT ' || default_campus_id;
          EXCEPTION WHEN others THEN
            NULL;
          END;
          BEGIN
            EXECUTE 'ALTER TABLE departments ALTER COLUMN campus_id SET NOT NULL';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_departments_campus_id ON departments(campus_id)';
      END IF;
    END $$;
  `);
}

// Idempotent alterations to support username-based auth and domain linkage
export async function ensureAuthSchema() {
  await query(`
    -- Users: username and nullable email
    ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key'
      ) THEN
        ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
      END IF;
    END $$;
    ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

    -- Students: link to users
    ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'students_user_id_key'
      ) THEN
        ALTER TABLE students ADD CONSTRAINT students_user_id_key UNIQUE (user_id);
      END IF;
    END $$;
    CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

    -- Teachers: link and allow null email
    ALTER TABLE teachers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'teachers_user_id_key'
      ) THEN
        ALTER TABLE teachers ADD CONSTRAINT teachers_user_id_key UNIQUE (user_id);
      END IF;
    END $$;
    CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
    ALTER TABLE teachers ALTER COLUMN email DROP NOT NULL;

    -- Drivers: link to users
    ALTER TABLE drivers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'drivers_user_id_key'
      ) THEN
        ALTER TABLE drivers ADD CONSTRAINT drivers_user_id_key UNIQUE (user_id);
      END IF;
    END $$;
    CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
  `);
}

export async function ensureAssignmentSubmissionSchema() {
  await query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignment_submissions') THEN
        EXECUTE 'ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS score NUMERIC(5,2)';
        EXECUTE 'ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS teacher_comment TEXT';
        EXECUTE 'ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS rubric TEXT';
        EXECUTE 'ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP';
        EXECUTE 'ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS graded_by INTEGER REFERENCES users(id) ON DELETE SET NULL';
        EXECUTE 'ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS status TEXT';

        UPDATE assignment_submissions SET status = ''submitted'' WHERE status IS NULL;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'assignment_submissions_assignment_student_key'
        ) THEN
          ALTER TABLE assignment_submissions ADD CONSTRAINT assignment_submissions_assignment_student_key UNIQUE (assignment_id, student_id);
        END IF;
      END IF;
    END $$;
  `);
}

export async function ensureSharedContentSchema() {
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'shared_contents'
      ) THEN
        EXECUTE '
          CREATE TABLE shared_contents (
            id SERIAL PRIMARY KEY,
            teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            url TEXT,
            subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
            class_name TEXT,
            section TEXT,
            status TEXT NOT NULL DEFAULT ''draft'',
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            published_at TIMESTAMP,
            campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL
          )
        ';
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shared_contents' AND column_name='campus_id') THEN
        EXECUTE 'ALTER TABLE shared_contents ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL';
      END IF;

      -- Ensure type/status constraints
      EXECUTE 'ALTER TABLE shared_contents DROP CONSTRAINT IF EXISTS shared_contents_type_check';
      EXECUTE 'ALTER TABLE shared_contents ADD CONSTRAINT shared_contents_type_check CHECK (type IN (''note'',''pdf'',''video'',''resource''))';
      EXECUTE 'ALTER TABLE shared_contents DROP CONSTRAINT IF EXISTS shared_contents_status_check';
      EXECUTE 'ALTER TABLE shared_contents ADD CONSTRAINT shared_contents_status_check CHECK (status IN (''draft'',''published''))';

      -- Helpful indexes
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_shared_contents_teacher ON shared_contents (teacher_id)';
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_shared_contents_subject ON shared_contents (subject_id)';
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_shared_contents_class ON shared_contents (class_name, section)';
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_shared_contents_status ON shared_contents (status)';
    END $$;
  `);
}

export async function ensureFinanceConstraints() {
  await query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name='fee_invoices' AND constraint_type='CHECK' AND constraint_name='fee_invoices_status_check'
      ) THEN
        EXECUTE 'ALTER TABLE fee_invoices DROP CONSTRAINT fee_invoices_status_check';
      END IF;
      EXECUTE 'ALTER TABLE fee_invoices ADD CONSTRAINT fee_invoices_status_check CHECK (status IN (''pending'',''in_progress'',''paid'',''overdue''))';
    END $$;
  `);
}

// Ensure Parents schema and students.family_number support
export async function ensureParentsSchema() {
  await query(`
    DO $$
    BEGIN
      -- Create parents table if it does not exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'parents'
      ) THEN
        EXECUTE '
          CREATE TABLE parents (
            id SERIAL PRIMARY KEY,
            family_number VARCHAR(64) NOT NULL UNIQUE,
            primary_name VARCHAR(255),
            father_name VARCHAR(255),
            mother_name VARCHAR(255),
            whatsapp_phone VARCHAR(64),
            email VARCHAR(255),
            address TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          )
        ';
      END IF;

      -- Add family_number to students table if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='family_number'
      ) THEN
        EXECUTE 'ALTER TABLE students ADD COLUMN family_number VARCHAR(64)';
      END IF;
    END $$;

    -- Index to speed up lookups by family_number
    CREATE INDEX IF NOT EXISTS idx_students_family_number ON students (family_number);
  `);
}

export async function ensureCampusSchema() {
  await query(`
    -- 1. Create campuses table if not exists
    CREATE TABLE IF NOT EXISTS campuses (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      address TEXT,
      phone TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    ALTER TABLE campuses
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS capacity INTEGER,
      ADD COLUMN IF NOT EXISTS status TEXT;

    UPDATE campuses SET status = 'active' WHERE status IS NULL;

    -- 2. Ensure at least one default campus exists (bootstrap)
    INSERT INTO campuses (name) 
    SELECT 'Main Campus' 
    WHERE NOT EXISTS (SELECT 1 FROM campuses LIMIT 1);

    -- 3. Add campus_id to core tables
    DO $$
    DECLARE
      tables TEXT[] := ARRAY[
        'users', 'students', 'teachers', 'drivers', 'parents', 
        'class_sections', 'exams', 'syllabus_items', 'assignments',
        'buses', 'routes', 'finance_invoices', 'finance_payments', 
        'finance_receipts', 'expenses', 'announcements', 'alerts', 
        'notifications', 'attendance_records', 'grading_schemes', 'subjects',
        'exam_results', 'assignment_submissions', 'rfid_logs', 
        'teacher_attendance', 'teacher_payrolls', 'teacher_performance_reviews',
        'teacher_schedules', 'teacher_subject_assignments', 'class_subjects',
        'student_transport', 'bus_assignments'
      ];
      t TEXT;
      default_campus_id INTEGER;
    BEGIN
      SELECT id INTO default_campus_id FROM campuses LIMIT 1;
      
      FOREACH t IN ARRAY tables
      LOOP
        -- Add campus_id column if missing
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t) THEN
          -- Some schemas may have legacy campus column names like "campusid". Normalize them.
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'campus_id')
             AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'campusid') THEN
            EXECUTE 'ALTER TABLE ' || t || ' RENAME COLUMN campusid TO campus_id';
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'campus_id') THEN
            EXECUTE 'ALTER TABLE ' || t || ' ADD COLUMN campus_id INTEGER REFERENCES campuses(id)';
            -- For existing rows, assign to default campus
            IF default_campus_id IS NOT NULL THEN
              EXECUTE 'UPDATE ' || t || ' SET campus_id = ' || default_campus_id || ' WHERE campus_id IS NULL';
            END IF;
          END IF;

          -- Backfill campus_id even if it already existed
          IF default_campus_id IS NOT NULL THEN
            EXECUTE 'UPDATE ' || t || ' SET campus_id = ' || default_campus_id || ' WHERE campus_id IS NULL';
          END IF;

          -- Make it mandatory after backfill (best-effort to avoid migration abort)
          BEGIN
            EXECUTE 'ALTER TABLE ' || t || ' ALTER COLUMN campus_id SET NOT NULL';
          EXCEPTION WHEN others THEN
            NULL;
          END;
          -- Ensure future inserts get a default campus_id
          IF default_campus_id IS NOT NULL THEN
            EXECUTE 'ALTER TABLE ' || t || ' ALTER COLUMN campus_id SET DEFAULT ' || default_campus_id;
          END IF;
          -- Add index for performance
          EXECUTE 'CREATE INDEX IF NOT EXISTS idx_' || t || '_campus_id ON ' || t || '(campus_id)';
        END IF;
      END LOOP;
    END $$;
  `);
}
