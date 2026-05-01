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

export async function ensureExamResultsSchema() {
  await query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exam_results') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_results' AND column_name='campus_id') THEN
          EXECUTE 'ALTER TABLE exam_results ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_results' AND column_name='created_at') THEN
          EXECUTE 'ALTER TABLE exam_results ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_results' AND column_name='updated_at') THEN
          EXECUTE 'ALTER TABLE exam_results ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results (exam_id);
    CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results (student_id);
    CREATE INDEX IF NOT EXISTS idx_exam_results_campus ON exam_results (campus_id);
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
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'id_card_templates') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='id_card_templates' AND column_name='logoUrl') THEN
          EXECUTE 'ALTER TABLE id_card_templates ALTER COLUMN "logoUrl" TYPE TEXT';
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='id_card_templates' AND column_name='logo_url') THEN
          EXECUTE 'ALTER TABLE id_card_templates ALTER COLUMN logo_url TYPE TEXT';
        END IF;
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admit_card_templates') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admit_card_templates' AND column_name='exam_name') THEN
          EXECUTE 'ALTER TABLE admit_card_templates ADD COLUMN exam_name TEXT';
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admit_card_templates' AND column_name='logoUrl') THEN
          EXECUTE 'ALTER TABLE admit_card_templates ALTER COLUMN "logoUrl" TYPE TEXT';
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admit_card_templates' AND column_name='logo_url') THEN
          EXECUTE 'ALTER TABLE admit_card_templates ALTER COLUMN logo_url TYPE TEXT';
        END IF;
      END IF;
    END $$;
  `);
}

export async function ensureClassSectionsSchema() {
  await query(`
    DO $$
    DECLARE
      default_campus_id INTEGER;
    BEGIN
      -- Only run if the table exists (it may not yet on first boot before schema.sql runs)
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'class_sections'
      ) THEN
        RETURN;
      END IF;

      SELECT id INTO default_campus_id FROM campuses ORDER BY id ASC LIMIT 1;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='class_sections' AND column_name='campus_id'
      ) THEN
        EXECUTE 'ALTER TABLE class_sections ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='class_sections' AND column_name='is_shared'
      ) THEN
        EXECUTE 'ALTER TABLE class_sections ADD COLUMN is_shared BOOLEAN DEFAULT FALSE';
      END IF;

      IF default_campus_id IS NOT NULL THEN
        EXECUTE format('UPDATE class_sections SET campus_id = %s WHERE campus_id IS NULL', default_campus_id);
      END IF;

      -- Create indexes only when table exists
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_class_sections_campus ON class_sections (campus_id)';
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_class_sections_shared ON class_sections (is_shared)';
    END $$;
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
    -- Upgrade users_role_check to include branch_admin
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('owner','admin','branch_admin','teacher','student','driver','parent'));

    -- Users: rename legacy 'password' column to 'password_hash' when coming from old schema
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='password'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='password_hash'
      ) THEN
        EXECUTE 'ALTER TABLE users RENAME COLUMN password TO password_hash';
      END IF;

      -- Drop NOT NULL from legacy 'password' column if both columns coexist
      -- (Sequelize schema created 'password' NOT NULL, new code uses 'password_hash')
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='password' AND is_nullable='NO'
      ) THEN
        EXECUTE 'ALTER TABLE users ALTER COLUMN password DROP NOT NULL';
      END IF;

      -- Backfill password_hash from password for any rows missing it
      IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password'
      ) AND EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash'
      ) THEN
        EXECUTE 'UPDATE users SET password_hash = password WHERE password_hash IS NULL AND password IS NOT NULL';
      END IF;

      -- Fix Sequelize camelCase timestamp columns: add DEFAULT NOW() so raw SQL inserts work
      -- without needing to specify createdAt/updatedAt explicitly
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='createdAt' AND column_default IS NULL
      ) THEN
        EXECUTE 'ALTER TABLE users ALTER COLUMN "createdAt" SET DEFAULT NOW()';
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='updatedAt' AND column_default IS NULL
      ) THEN
        EXECUTE 'ALTER TABLE users ALTER COLUMN "updatedAt" SET DEFAULT NOW()';
      END IF;
    END $$;

    -- Users: ensure password_hash exists for legacy schemas
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

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
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
        -- Normalize legacy Sequelize column name "userId" to user_id
        IF EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='userId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='user_id'
        ) THEN
          EXECUTE 'ALTER TABLE students RENAME COLUMN "userId" TO user_id';
        END IF;

        -- If legacy "userId" still exists (e.g., both columns exist), make it nullable so inserts won't fail.
        IF EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='userId'
        ) THEN
          BEGIN
            EXECUTE 'ALTER TABLE students ALTER COLUMN "userId" DROP NOT NULL';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;

        EXECUTE 'ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL';
        -- Ensure the linkage column is nullable (some legacy schemas made it NOT NULL)
        BEGIN
          EXECUTE 'ALTER TABLE students ALTER COLUMN user_id DROP NOT NULL';
        EXCEPTION WHEN others THEN
          NULL;
        END;

        -- Backfill user_id from legacy "userId" if present
        IF EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='userId'
        ) THEN
          BEGIN
            EXECUTE 'UPDATE students SET user_id = "userId" WHERE user_id IS NULL AND "userId" IS NOT NULL';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'students_user_id_key'
        ) THEN
          EXECUTE 'ALTER TABLE students ADD CONSTRAINT students_user_id_key UNIQUE (user_id)';
        END IF;
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id)';
      END IF;
    END $$;

    -- Teachers: link and allow null email
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers') THEN
        -- Normalize legacy Sequelize column name "userId" to user_id
        IF EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='userId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='user_id'
        ) THEN
          EXECUTE 'ALTER TABLE teachers RENAME COLUMN "userId" TO user_id';
        END IF;

        -- If legacy "userId" still exists (e.g., both columns exist), make it nullable so inserts won't fail.
        IF EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='userId'
        ) THEN
          BEGIN
            EXECUTE 'ALTER TABLE teachers ALTER COLUMN "userId" DROP NOT NULL';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;

        EXECUTE 'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL';

        -- Ensure the linkage column is nullable (some legacy schemas made it NOT NULL)
        BEGIN
          EXECUTE 'ALTER TABLE teachers ALTER COLUMN user_id DROP NOT NULL';
        EXCEPTION WHEN others THEN
          NULL;
        END;

        -- Backfill user_id from legacy "userId" if present
        IF EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='userId'
        ) THEN
          BEGIN
            EXECUTE 'UPDATE teachers SET user_id = "userId" WHERE user_id IS NULL AND "userId" IS NOT NULL';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'teachers_user_id_key'
        ) THEN
          EXECUTE 'ALTER TABLE teachers ADD CONSTRAINT teachers_user_id_key UNIQUE (user_id)';
        END IF;
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id)';

        -- Only attempt to drop NOT NULL if the email column exists
        IF EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='email'
        ) THEN
          BEGIN
            EXECUTE 'ALTER TABLE teachers ALTER COLUMN email DROP NOT NULL';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;
      END IF;
    END $$;

    -- Drivers: link to users
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
        EXECUTE 'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL';
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'drivers_user_id_key'
        ) THEN
          EXECUTE 'ALTER TABLE drivers ADD CONSTRAINT drivers_user_id_key UNIQUE (user_id)';
        END IF;
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id)';
      END IF;
    END $$;
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
    DECLARE
      c RECORD;
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name='fee_invoices' AND constraint_type='CHECK' AND constraint_name='fee_invoices_status_check'
      ) THEN
        EXECUTE 'ALTER TABLE fee_invoices DROP CONSTRAINT fee_invoices_status_check';
      END IF;
      EXECUTE 'ALTER TABLE fee_invoices ADD CONSTRAINT fee_invoices_status_check CHECK (status IN (''pending'',''in_progress'',''paid'',''overdue''))';

      IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'finance_invoices'
      ) THEN
        FOR c IN (
          SELECT conname
          FROM pg_constraint
          WHERE conrelid = 'public.finance_invoices'::regclass
            AND contype = 'c'
            AND pg_get_constraintdef(oid) ILIKE '%invoice_type%'
        ) LOOP
          EXECUTE format('ALTER TABLE finance_invoices DROP CONSTRAINT IF EXISTS %I', c.conname);
        END LOOP;

        EXECUTE 'ALTER TABLE finance_invoices ADD CONSTRAINT finance_invoices_invoice_type_check CHECK (invoice_type IN (''fee'',''exam_fee'',''annual_fee'',''admission_fee'',''transport_fee'',''salary'',''allowance'',''deduction'',''other''))';
      END IF;
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

export async function ensureParentMessagesSchema() {
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'parent_messages'
      ) THEN
        EXECUTE '
          CREATE TABLE parent_messages (
            id SERIAL PRIMARY KEY,
            parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
            child_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
            to_phone TEXT,
            from_phone TEXT,
            channel TEXT, -- whatsapp | sms | whatsapp-web | webhook | cloud
            direction TEXT NOT NULL CHECK (direction IN (''outbound'',''inbound'')),
            body TEXT NOT NULL,
            status TEXT, -- queued | sent | delivered | read | failed
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL
          )
        ';
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='parent_messages' AND column_name='campus_id'
      ) THEN
        EXECUTE 'ALTER TABLE parent_messages ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL';
      END IF;
      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_parent_messages_parent ON parent_messages (parent_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_parent_messages_created ON parent_messages (created_at);
    END $$;
  `);
}

export async function ensureCoreTableColumns() {
  await query(`
    DO $$
    BEGIN
      -- ===== STUDENTS TABLE =====
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='students') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='status') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN status TEXT NOT NULL DEFAULT ''active''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='name') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN name TEXT NOT NULL DEFAULT ''''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='email') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN email TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='roll_number') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN roll_number TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='class') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN class TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='section') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN section TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='rfid_tag') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN rfid_tag TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='attendance') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN attendance NUMERIC(5,2) DEFAULT 0';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='fee_status') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN fee_status TEXT DEFAULT ''paid''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='bus_number') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN bus_number TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='bus_assigned') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN bus_assigned BOOLEAN DEFAULT FALSE';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='parent_name') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN parent_name TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='parent_phone') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN parent_phone TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='admission_date') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN admission_date DATE DEFAULT CURRENT_DATE';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='avatar') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN avatar TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='created_at') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='updated_at') THEN
          EXECUTE 'ALTER TABLE students ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
      END IF;

      -- ===== BUSES TABLE =====
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='buses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='buses' AND column_name='status') THEN
          EXECUTE 'ALTER TABLE buses ADD COLUMN status TEXT DEFAULT ''active''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='buses' AND column_name='number') THEN
          EXECUTE 'ALTER TABLE buses ADD COLUMN number TEXT NOT NULL DEFAULT ''''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='buses' AND column_name='driver_name') THEN
          EXECUTE 'ALTER TABLE buses ADD COLUMN driver_name TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='buses' AND column_name='capacity') THEN
          EXECUTE 'ALTER TABLE buses ADD COLUMN capacity INTEGER DEFAULT 0';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='buses' AND column_name='route') THEN
          EXECUTE 'ALTER TABLE buses ADD COLUMN route TEXT';
        END IF;
      END IF;

      -- ===== ALERTS TABLE =====
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='alerts') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='status') THEN
          EXECUTE 'ALTER TABLE alerts ADD COLUMN status TEXT NOT NULL DEFAULT ''active''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='type') THEN
          EXECUTE 'ALTER TABLE alerts ADD COLUMN type TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='is_read') THEN
          EXECUTE 'ALTER TABLE alerts ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='target_user_id') THEN
          EXECUTE 'ALTER TABLE alerts ADD COLUMN target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='severity') THEN
          EXECUTE 'ALTER TABLE alerts ADD COLUMN severity TEXT NOT NULL DEFAULT ''info''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='message') THEN
          EXECUTE 'ALTER TABLE alerts ADD COLUMN message TEXT NOT NULL DEFAULT ''''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='created_at') THEN
          EXECUTE 'ALTER TABLE alerts ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
      END IF;

      -- ===== ATTENDANCE_RECORDS TABLE =====
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='attendance_records') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_records' AND column_name='status') THEN
          EXECUTE 'ALTER TABLE attendance_records ADD COLUMN status TEXT NOT NULL DEFAULT ''present''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_records' AND column_name='date') THEN
          EXECUTE 'ALTER TABLE attendance_records ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_records' AND column_name='check_in_time') THEN
          EXECUTE 'ALTER TABLE attendance_records ADD COLUMN check_in_time TIME';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_records' AND column_name='check_out_time') THEN
          EXECUTE 'ALTER TABLE attendance_records ADD COLUMN check_out_time TIME';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_records' AND column_name='remarks') THEN
          EXECUTE 'ALTER TABLE attendance_records ADD COLUMN remarks TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_records' AND column_name='created_at') THEN
          EXECUTE 'ALTER TABLE attendance_records ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
      END IF;

      -- ===== USERS TABLE =====
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='users') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='name') THEN
          EXECUTE 'ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT ''''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='status') THEN
          EXECUTE 'ALTER TABLE users ADD COLUMN status TEXT DEFAULT ''active''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar') THEN
          EXECUTE 'ALTER TABLE users ADD COLUMN avatar TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='campus_id') THEN
          EXECUTE 'ALTER TABLE users ADD COLUMN campus_id INTEGER';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_at') THEN
          EXECUTE 'ALTER TABLE users ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
      END IF;

      -- ===== FINANCE_INVOICES TABLE =====
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='finance_invoices') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finance_invoices' AND column_name='status') THEN
          EXECUTE 'ALTER TABLE finance_invoices ADD COLUMN status TEXT NOT NULL DEFAULT ''pending''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finance_invoices' AND column_name='total') THEN
          EXECUTE 'ALTER TABLE finance_invoices ADD COLUMN total NUMERIC(12,2) DEFAULT 0';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finance_invoices' AND column_name='balance') THEN
          EXECUTE 'ALTER TABLE finance_invoices ADD COLUMN balance NUMERIC(12,2) DEFAULT 0';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finance_invoices' AND column_name='issued_at') THEN
          EXECUTE 'ALTER TABLE finance_invoices ADD COLUMN issued_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finance_invoices' AND column_name='user_type') THEN
          EXECUTE 'ALTER TABLE finance_invoices ADD COLUMN user_type TEXT DEFAULT ''student''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finance_invoices' AND column_name='invoice_type') THEN
          EXECUTE 'ALTER TABLE finance_invoices ADD COLUMN invoice_type TEXT DEFAULT ''fee''';
        END IF;
      END IF;

      -- ===== DRIVERS TABLE =====
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='drivers') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='drivers' AND column_name='status') THEN
          EXECUTE 'ALTER TABLE drivers ADD COLUMN status TEXT DEFAULT ''active''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='drivers' AND column_name='name') THEN
          EXECUTE 'ALTER TABLE drivers ADD COLUMN name TEXT NOT NULL DEFAULT ''''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='drivers' AND column_name='created_at') THEN
          EXECUTE 'ALTER TABLE drivers ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='drivers' AND column_name='updated_at') THEN
          EXECUTE 'ALTER TABLE drivers ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
      END IF;

      -- ===== CLASS_SECTIONS TABLE =====
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='class_sections') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='status') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN status TEXT NOT NULL DEFAULT ''active''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='class_name') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN class_name TEXT NOT NULL DEFAULT ''''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='section') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN section TEXT NOT NULL DEFAULT ''''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='academic_year') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN academic_year TEXT NOT NULL DEFAULT ''''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='capacity') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN capacity INTEGER NOT NULL DEFAULT 30';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='enrolled_students') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN enrolled_students INTEGER NOT NULL DEFAULT 0';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='is_shared') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN is_shared BOOLEAN DEFAULT FALSE';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='room') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN room TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='medium') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN medium TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='shift') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN shift TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='notes') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN notes TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='campus_id') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN campus_id INTEGER';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='class_teacher_id') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN class_teacher_id INTEGER';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='created_at') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_sections' AND column_name='updated_at') THEN
          EXECUTE 'ALTER TABLE class_sections ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
      END IF;


      -- ===== SUBJECTS TABLE =====
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='subjects') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='name') THEN
          EXECUTE 'ALTER TABLE subjects ADD COLUMN name TEXT NOT NULL DEFAULT ''''';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='code') THEN
          EXECUTE 'ALTER TABLE subjects ADD COLUMN code TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='department') THEN
          EXECUTE 'ALTER TABLE subjects ADD COLUMN department TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='description') THEN
          EXECUTE 'ALTER TABLE subjects ADD COLUMN description TEXT';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='created_at') THEN
          EXECUTE 'ALTER TABLE subjects ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='updated_at') THEN
          EXECUTE 'ALTER TABLE subjects ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW()';
        END IF;
      END IF;

    END $$;
  `);
}

export async function ensureTeachersNameColumn() {
  await query(`
    DO $$
    BEGIN
      -- Safety: only run when teachers table exists
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'teachers'
      ) THEN
        RETURN;
      END IF;

      -- Add 'name' column if missing (primary fix for "column name does not exist" errors)
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='name'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN name TEXT NOT NULL DEFAULT ''''';
      END IF;

      -- Add 'email' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='email'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN email TEXT';
      END IF;

      -- Add 'phone' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='phone'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN phone TEXT';
      END IF;

      -- Add 'gender' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='gender'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN gender TEXT';
      END IF;

      -- Add 'dob' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='dob'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN dob DATE';
      END IF;

      -- Add 'qualification' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='qualification'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN qualification TEXT';
      END IF;

      -- Add 'department' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='department'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN department TEXT';
      END IF;

      -- Add 'designation' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='designation'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN designation TEXT';
      END IF;

      -- Add 'joining_date' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='joining_date'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN joining_date DATE NOT NULL DEFAULT CURRENT_DATE';
      END IF;

      -- Add 'employee_id' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='employee_id'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN employee_id TEXT NOT NULL DEFAULT ''''';
      END IF;

      -- Add 'user_id' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='user_id'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL';
      END IF;

      -- Add 'salary' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='salary'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN salary NUMERIC(12,2) DEFAULT 0';
      END IF;

      -- Add 'subject' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='subject'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN subject TEXT';
      END IF;


      -- Add 'subjects' JSONB column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='subjects'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN subjects JSONB NOT NULL DEFAULT ''[]''::jsonb';
      END IF;

      -- If subjects exists but is not JSONB (e.g., TEXT[] from Sequelize), convert it.
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='subjects' AND data_type <> 'jsonb'
      ) THEN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name='teachers' AND column_name='subjects' AND data_type = 'ARRAY'
        ) THEN
          -- Drop existing default to avoid: default cannot be cast automatically to type jsonb
          BEGIN
            EXECUTE 'ALTER TABLE teachers ALTER COLUMN subjects DROP DEFAULT';
          EXCEPTION WHEN others THEN
            NULL;
          END;
          EXECUTE 'ALTER TABLE teachers ALTER COLUMN subjects TYPE JSONB USING COALESCE(to_jsonb(subjects), ''[]''::jsonb)';
          BEGIN
            EXECUTE 'ALTER TABLE teachers ALTER COLUMN subjects SET DEFAULT ''[]''::jsonb';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        ELSE
          BEGIN
            EXECUTE 'ALTER TABLE teachers ALTER COLUMN subjects DROP DEFAULT';
          EXCEPTION WHEN others THEN
            NULL;
          END;
          EXECUTE format($cmd$
            ALTER TABLE teachers ALTER COLUMN subjects TYPE JSONB USING (
              CASE
                WHEN subjects IS NULL OR btrim(subjects::text) = '' THEN '[]'::jsonb
                WHEN btrim(subjects::text) LIKE '[%%' THEN subjects::jsonb
                ELSE to_jsonb(string_to_array(subjects::text, ','))
              END
            )
          $cmd$);
          BEGIN
            EXECUTE 'ALTER TABLE teachers ALTER COLUMN subjects SET DEFAULT ''[]''::jsonb';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;
      END IF;

      -- Add 'classes' JSONB column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='classes'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN classes JSONB NOT NULL DEFAULT ''[]''::jsonb';
      END IF;

      -- If classes exists but is not JSONB, convert it.
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='classes' AND data_type <> 'jsonb'
      ) THEN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name='teachers' AND column_name='classes' AND data_type = 'ARRAY'
        ) THEN
          BEGIN
            EXECUTE 'ALTER TABLE teachers ALTER COLUMN classes DROP DEFAULT';
          EXCEPTION WHEN others THEN
            NULL;
          END;
          EXECUTE 'ALTER TABLE teachers ALTER COLUMN classes TYPE JSONB USING COALESCE(to_jsonb(classes), ''[]''::jsonb)';
          BEGIN
            EXECUTE 'ALTER TABLE teachers ALTER COLUMN classes SET DEFAULT ''[]''::jsonb';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        ELSE
          BEGIN
            EXECUTE 'ALTER TABLE teachers ALTER COLUMN classes DROP DEFAULT';
          EXCEPTION WHEN others THEN
            NULL;
          END;
          EXECUTE format($cmd$
            ALTER TABLE teachers ALTER COLUMN classes TYPE JSONB USING (
              CASE
                WHEN classes IS NULL OR btrim(classes::text) = '' THEN '[]'::jsonb
                WHEN btrim(classes::text) LIKE '[%%' THEN classes::jsonb
                ELSE to_jsonb(string_to_array(classes::text, ','))
              END
            )
          $cmd$);
          BEGIN
            EXECUTE 'ALTER TABLE teachers ALTER COLUMN classes SET DEFAULT ''[]''::jsonb';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;
      END IF;

      -- Add 'avatar' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='avatar'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN avatar TEXT';
      END IF;

      -- Add 'blood_group' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='blood_group'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN blood_group TEXT';
      END IF;

      -- Add 'religion' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='religion'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN religion TEXT';
      END IF;

      -- Add 'national_id' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='national_id'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN national_id TEXT';
      END IF;

      -- Add 'address_line1' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='address_line1'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN address_line1 TEXT';
      END IF;

      -- Add 'address_line2' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='address_line2'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN address_line2 TEXT';
      END IF;

      -- Add 'city' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='city'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN city TEXT';
      END IF;

      -- Add 'state' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='state'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN state TEXT';
      END IF;

      -- Add 'postal_code' column if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='postal_code'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN postal_code TEXT';
      END IF;

      -- Add emergency contact columns if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='emergency_name'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN emergency_name TEXT';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='emergency_phone'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN emergency_phone TEXT';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='emergency_relation'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN emergency_relation TEXT';
      END IF;

      -- Add financial columns if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='base_salary'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN base_salary NUMERIC(12,2) DEFAULT 0';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='allowances'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN allowances NUMERIC(12,2) DEFAULT 0';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='deductions'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN deductions NUMERIC(12,2) DEFAULT 0';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='currency'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN currency TEXT DEFAULT ''PKR''';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='pay_frequency'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN pay_frequency TEXT DEFAULT ''monthly''';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='payment_method'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN payment_method TEXT DEFAULT ''bank''';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='bank_name'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN bank_name TEXT';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='account_number'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN account_number TEXT';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='iban'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN iban TEXT';
      END IF;

      -- Add employment/HR columns if missing
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='employment_type'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN employment_type TEXT NOT NULL DEFAULT ''fullTime''';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='employment_status'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN employment_status TEXT NOT NULL DEFAULT ''active''';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='status'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN status TEXT NOT NULL DEFAULT ''active''';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='probation_end_date'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN probation_end_date DATE';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='contract_end_date'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN contract_end_date DATE';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='work_hours_per_week'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN work_hours_per_week NUMERIC(5,2)';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='experience_years'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN experience_years NUMERIC(4,1)';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='specialization'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN specialization TEXT';
      END IF;

      -- timestamps
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='created_at'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW()';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name='teachers' AND column_name='updated_at'
      ) THEN
        EXECUTE 'ALTER TABLE teachers ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW()';
      END IF;
    END $$;
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
