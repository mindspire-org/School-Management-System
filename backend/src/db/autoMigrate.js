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
