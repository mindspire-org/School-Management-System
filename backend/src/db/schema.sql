-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','teacher','student','driver')),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Upgrade roles to include owner and parent
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('owner','admin','teacher','student','driver','parent'));

-- Username-based login support and nullable email for non-email users
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;

-- Allow NULL email (students/drivers may not have emails)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Students
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  roll_number TEXT,
  class TEXT,
  section TEXT,
  rfid_tag TEXT,
  attendance NUMERIC(5,2) DEFAULT 0,
  fee_status TEXT DEFAULT 'paid' CHECK (fee_status IN ('paid','pending','overdue')),
  bus_number TEXT,
  bus_assigned BOOLEAN DEFAULT FALSE,
  parent_name TEXT,
  parent_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  admission_date DATE DEFAULT CURRENT_DATE,
  avatar TEXT
);

-- Extended JSON fields to store full details from Add Student form
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS personal JSONB,
  ADD COLUMN IF NOT EXISTS academic JSONB,
  ADD COLUMN IF NOT EXISTS parent JSONB,
  ADD COLUMN IF NOT EXISTS transport JSONB,
  ADD COLUMN IF NOT EXISTS fee JSONB;

-- Allow 'in_progress' in students.fee_status for parity with invoices aggregation
ALTER TABLE students
  DROP CONSTRAINT IF EXISTS students_fee_status_check;

ALTER TABLE students
  ADD CONSTRAINT students_fee_status_check CHECK (fee_status IN ('paid','pending','in_progress','overdue'));

-- Link students to users table for per-user authentication
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_user_id_key'
  ) THEN
    ALTER TABLE students ADD CONSTRAINT students_user_id_key UNIQUE (user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  qualification TEXT,
  gender TEXT,
  dob DATE,
  blood_group TEXT,
  religion TEXT,
  national_id TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  emergency_name TEXT,
  emergency_phone TEXT,
  emergency_relation TEXT,
  employment_type TEXT NOT NULL DEFAULT 'fullTime',
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  employee_id TEXT NOT NULL UNIQUE,
  department TEXT,
  designation TEXT,
  experience_years NUMERIC(4,1),
  specialization TEXT,
  subject TEXT,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  employment_status TEXT NOT NULL DEFAULT 'active',
  status TEXT NOT NULL DEFAULT 'active',
  probation_end_date DATE,
  contract_end_date DATE,
  work_hours_per_week NUMERIC(5,2),
  base_salary NUMERIC(12,2) DEFAULT 0,
  allowances NUMERIC(12,2) DEFAULT 0,
  deductions NUMERIC(12,2) DEFAULT 0,
  salary NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  pay_frequency TEXT DEFAULT 'monthly',
  payment_method TEXT DEFAULT 'bank',
  bank_name TEXT,
  account_number TEXT,
  iban TEXT,
  avatar TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Allow NULL emails for teachers to support username-only accounts
ALTER TABLE teachers ALTER COLUMN email DROP NOT NULL;

-- Backfill columns for existing deployments
ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS qualification TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS blood_group TEXT,
  ADD COLUMN IF NOT EXISTS religion TEXT,
  ADD COLUMN IF NOT EXISTS national_id TEXT,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS emergency_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_relation TEXT,
  ADD COLUMN IF NOT EXISTS employment_type TEXT NOT NULL DEFAULT 'fullTime',
  ADD COLUMN IF NOT EXISTS joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS employee_id TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS experience_years NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS specialization TEXT,
  ADD COLUMN IF NOT EXISTS subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS employment_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS probation_end_date DATE,
  ADD COLUMN IF NOT EXISTS contract_end_date DATE,
  ADD COLUMN IF NOT EXISTS work_hours_per_week NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS base_salary NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS allowances NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deductions NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'PKR',
  ADD COLUMN IF NOT EXISTS pay_frequency TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank',
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT,
  ADD COLUMN IF NOT EXISTS iban TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Link teachers to users table for per-user authentication
ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teachers_user_id_key'
  ) THEN
    ALTER TABLE teachers ADD CONSTRAINT teachers_user_id_key UNIQUE (user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);

UPDATE teachers SET employee_id = CONCAT('T-', id) WHERE employee_id IS NULL;

ALTER TABLE teachers
  ALTER COLUMN employee_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teachers_employee_id_key'
  ) THEN
    ALTER TABLE teachers ADD CONSTRAINT teachers_employee_id_key UNIQUE (employee_id);
  END IF;
END $$;

-- Syllabus tracking
CREATE TABLE IF NOT EXISTS syllabus_items (
  id SERIAL PRIMARY KEY,
  class_name TEXT NOT NULL,
  section TEXT,
  subject TEXT NOT NULL,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  chapters INTEGER NOT NULL DEFAULT 0 CHECK (chapters >= 0),
  covered INTEGER NOT NULL DEFAULT 0 CHECK (covered >= 0),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_syllabus_class ON syllabus_items (class_name, section);
CREATE INDEX IF NOT EXISTS idx_syllabus_subject ON syllabus_items (subject);
CREATE INDEX IF NOT EXISTS idx_syllabus_teacher ON syllabus_items (teacher_id);

UPDATE teachers SET subjects = '[]'::jsonb WHERE subjects IS NULL;
UPDATE teachers SET classes = '[]'::jsonb WHERE classes IS NULL;

UPDATE teachers SET status = 'active' WHERE status IS NULL;

ALTER TABLE teachers
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE teachers
  ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE teachers
  DROP CONSTRAINT IF EXISTS teachers_status_check;

ALTER TABLE teachers
  ADD CONSTRAINT teachers_status_check CHECK (status IN ('active','inactive','on_leave','resigned'));

ALTER TABLE teachers
  DROP CONSTRAINT IF EXISTS teachers_employment_status_check;

ALTER TABLE teachers
  ADD CONSTRAINT teachers_employment_status_check CHECK (employment_status IN ('active','inactive','on_leave','resigned'));

ALTER TABLE teachers
  DROP CONSTRAINT IF EXISTS teachers_employment_type_check;

ALTER TABLE teachers
  ADD CONSTRAINT teachers_employment_type_check CHECK (employment_type IN ('fullTime','partTime'));

ALTER TABLE teachers
  DROP CONSTRAINT IF EXISTS teachers_pay_frequency_check;

ALTER TABLE teachers
  ADD CONSTRAINT teachers_pay_frequency_check CHECK (pay_frequency IN ('monthly','biweekly','weekly'));

ALTER TABLE teachers
  DROP CONSTRAINT IF EXISTS teachers_payment_method_check;

ALTER TABLE teachers
  ADD CONSTRAINT teachers_payment_method_check CHECK (payment_method IN ('bank','cash','cheque'));

-- Class sections (grade/section master)
CREATE TABLE IF NOT EXISTS class_sections (
  id SERIAL PRIMARY KEY,
  class_name TEXT NOT NULL,
  section TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '',
  class_teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  capacity INTEGER NOT NULL DEFAULT 30 CHECK (capacity > 0),
  enrolled_students INTEGER NOT NULL DEFAULT 0 CHECK (enrolled_students >= 0),
  room TEXT,
  medium TEXT,
  shift TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (class_name, section, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_class_sections_teacher ON class_sections (class_teacher_id);

-- Teacher schedules
CREATE TABLE IF NOT EXISTS teacher_schedules (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  class TEXT,
  section TEXT,
  subject TEXT
);

ALTER TABLE teacher_schedules
  ADD COLUMN IF NOT EXISTS room TEXT,
  ADD COLUMN IF NOT EXISTS time_slot_index INTEGER,
  ADD COLUMN IF NOT EXISTS time_slot_label TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

DO $$
BEGIN
  -- Deduplicate existing schedule slots before adding unique constraint
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT teacher_id, day_of_week, start_time, COUNT(*) AS c
      FROM teacher_schedules
      GROUP BY teacher_id, day_of_week, start_time
      HAVING COUNT(*) > 1
    ) d
  ) THEN
    WITH ranked AS (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY teacher_id, day_of_week, start_time ORDER BY id) AS rn
      FROM teacher_schedules
    )
    DELETE FROM teacher_schedules t
    USING ranked r
    WHERE t.id = r.id AND r.rn > 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teacher_schedule_unique_slot'
  ) THEN
    ALTER TABLE teacher_schedules
      ADD CONSTRAINT teacher_schedule_unique_slot UNIQUE (teacher_id, day_of_week, start_time);
  END IF;
END $$;

-- Academic subjects master
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  department TEXT,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Teacher <> subject allocation
CREATE TABLE IF NOT EXISTS teacher_subject_assignments (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  academic_year TEXT NOT NULL DEFAULT '',
  assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE teacher_subject_assignments
  ALTER COLUMN academic_year SET DEFAULT '';

UPDATE teacher_subject_assignments SET academic_year = '' WHERE academic_year IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teacher_subject_assignments_unique'
  ) THEN
    ALTER TABLE teacher_subject_assignments
      ADD CONSTRAINT teacher_subject_assignments_unique UNIQUE (teacher_id, subject_id, academic_year);
  END IF;
END $$;

-- Teacher attendance records
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present','absent','late')),
  check_in_time TIME,
  check_out_time TIME,
  remarks TEXT,
  recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (teacher_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_teacher_attendance_date ON teacher_attendance (attendance_date);
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_teacher ON teacher_attendance (teacher_id);

-- Teacher payroll records
CREATE TABLE IF NOT EXISTS teacher_payrolls (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  period_month DATE NOT NULL,
  base_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  allowances NUMERIC(12,2) NOT NULL DEFAULT 0,
  deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  bonuses NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed','cancelled')),
  payment_method TEXT,
  bank_name TEXT,
  account_title TEXT,
  account_number TEXT,
  iban TEXT,
  cheque_number TEXT,
  transaction_reference TEXT,
  paid_on TIMESTAMP,
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (teacher_id, period_month)
);

CREATE INDEX IF NOT EXISTS idx_teacher_payrolls_period ON teacher_payrolls (period_month);
CREATE INDEX IF NOT EXISTS idx_teacher_payrolls_status ON teacher_payrolls (status);

-- Teacher performance reviews
CREATE TABLE IF NOT EXISTS teacher_performance_reviews (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL,
  period_label TEXT,
  period_start DATE,
  period_end DATE,
  overall_score NUMERIC(5,2),
  student_feedback_score NUMERIC(5,2),
  attendance_score NUMERIC(5,2),
  class_management_score NUMERIC(5,2),
  exam_results_score NUMERIC(5,2),
  status TEXT,
  improvement NUMERIC(5,2),
  remarks TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teacher_performance_period ON teacher_performance_reviews (period_type, period_label);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  class TEXT,
  section TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_name ON students (name);
CREATE INDEX IF NOT EXISTS idx_students_roll ON students (roll_number);
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers (name);
CREATE INDEX IF NOT EXISTS idx_teachers_department ON teachers (department);
CREATE INDEX IF NOT EXISTS idx_assignments_due ON assignments (due_date);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present','absent','late','leave')),
  remarks TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, date)
);
ALTER TABLE attendance_records
  ADD COLUMN IF NOT EXISTS check_in_time TIME,
  ADD COLUMN IF NOT EXISTS check_out_time TIME,
  ADD COLUMN IF NOT EXISTS campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL;

ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_status_check;
ALTER TABLE attendance_records ADD CONSTRAINT attendance_records_status_check CHECK (status IN ('present','absent','late','leave'));

-- Transport: Buses and Routes
CREATE TABLE IF NOT EXISTS buses (
  id SERIAL PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  driver_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','maintenance','inactive')),
  campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS route_stops (
  id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  sequence INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bus_assignments (
  id SERIAL PRIMARY KEY,
  bus_id INTEGER NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(bus_id)
);

CREATE TABLE IF NOT EXISTS student_transport (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  route_id INTEGER REFERENCES routes(id) ON DELETE SET NULL,
  bus_id INTEGER REFERENCES buses(id) ON DELETE SET NULL,
  pickup_stop_id INTEGER REFERENCES route_stops(id) ON DELETE SET NULL,
  drop_stop_id INTEGER REFERENCES route_stops(id) ON DELETE SET NULL
);

-- RFID scan logs
CREATE TABLE IF NOT EXISTS rfid_logs (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  card_number TEXT,
  bus_number TEXT,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','failed')),
  location TEXT,
  scan_time TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Finance: Invoices and Payments
CREATE TABLE IF NOT EXISTS fee_invoices (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue')),
  due_date DATE,
  issued_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ensure invoices can be marked 'in_progress' by UI
ALTER TABLE fee_invoices
  DROP CONSTRAINT IF EXISTS fee_invoices_status_check;

ALTER TABLE fee_invoices
  ADD CONSTRAINT fee_invoices_status_check CHECK (status IN ('pending','in_progress','paid','overdue'));

CREATE TABLE IF NOT EXISTS fee_payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES fee_invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT,
  paid_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Communication: Announcements and Alerts
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience TEXT DEFAULT 'all',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL
);

-- Teacher shared content (study materials feed)
CREATE TABLE IF NOT EXISTS shared_contents (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note','pdf','video','resource')),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
  class_name TEXT,
  section TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP,
  campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_shared_contents_teacher ON shared_contents (teacher_id);
CREATE INDEX IF NOT EXISTS idx_shared_contents_subject ON shared_contents (subject_id);
CREATE INDEX IF NOT EXISTS idx_shared_contents_class ON shared_contents (class_name, section);
CREATE INDEX IF NOT EXISTS idx_shared_contents_status ON shared_contents (status);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Extend alerts for operational workflow
ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved')),
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;

-- Targeted alerts: allow alerts to be addressed to a specific user
ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Settings (key-value)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Academics: Exams & Results
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  exam_date DATE,
  class TEXT,
  section TEXT
);

-- Extend exams table to support scheduling and status
ALTER TABLE exams ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS classes TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS invigilator_id INTEGER REFERENCES teachers(id);

-- Upgrade start/end to timestamps to store time of day
ALTER TABLE exams ALTER COLUMN start_date TYPE TIMESTAMP WITHOUT TIME ZONE USING start_date::timestamp;
ALTER TABLE exams ALTER COLUMN end_date TYPE TIMESTAMP WITHOUT TIME ZONE USING end_date::timestamp;

CREATE TABLE IF NOT EXISTS exam_results (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT,
  marks NUMERIC(5,2),
  grade TEXT,
  UNIQUE(exam_id, student_id, subject)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records (student_id, date);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_status ON fee_invoices (status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read);

-- View: Flatten full student JSONB details into separate columns for reporting/pgAdmin
CREATE OR REPLACE VIEW student_full_flat AS
SELECT
  s.id,
  s.name,
  s.email,
  s.roll_number AS roll_number,
  s.class,
  s.section,
  s.rfid_tag AS rfid_tag,
  s.attendance,
  s.fee_status AS fee_status,
  s.bus_number AS bus_number,
  s.bus_assigned AS bus_assigned,
  s.parent_name AS parent_name,
  s.parent_phone AS parent_phone,
  s.status,
  s.admission_date AS admission_date,
  s.avatar,
  -- personal
  s.personal->>'name' AS personal_name,
  s.personal->>'gender' AS personal_gender,
  s.personal->>'dateOfBirth' AS personal_date_of_birth,
  s.personal->>'bloodGroup' AS personal_blood_group,
  s.personal->>'religion' AS personal_religion,
  s.personal->>'nationality' AS personal_nationality,
  s.personal->>'cnic' AS personal_cnic,
  s.personal->>'email' AS personal_email,
  s.personal->>'phone' AS personal_phone,
  s.personal->'address'->>'street' AS personal_address_street,
  s.personal->'address'->>'city' AS personal_address_city,
  s.personal->'address'->>'province' AS personal_address_province,
  s.personal->'address'->>'postalCode' AS personal_address_postal_code,
  s.personal->>'medicalConditions' AS personal_medical_conditions,
  -- academic
  s.academic->>'admissionNumber' AS academic_admission_number,
  s.academic->>'academicYear' AS academic_year,
  s.academic->>'previousSchool' AS academic_previous_school,
  s.academic->>'previousClass' AS academic_previous_class,
  s.academic->>'specialNeeds' AS academic_special_needs,
  s.academic->>'rollNumber' AS academic_roll_number,
  s.academic->>'class' AS academic_class,
  s.academic->>'section' AS academic_section,
  s.academic->>'rfidTag' AS academic_rfid_tag,
  s.academic->>'admissionDate' AS academic_admission_date,
  s.academic->'previousEducation'->>'schoolName' AS academic_prev_school_name,
  s.academic->'previousEducation'->>'class' AS academic_prev_class,
  s.academic->'previousEducation'->>'lastAttendedDate' AS academic_prev_last_attended,
  s.academic->'previousEducation'->>'transferCertificateNo' AS academic_prev_tc_no,
  s.academic->'previousEducation'->>'remarks' AS academic_prev_remarks,
  s.academic->>'stream' AS academic_stream,
  -- parent (father)
  s.parent->'father'->>'name' AS father_name,
  s.parent->'father'->>'cnic' AS father_cnic,
  s.parent->'father'->>'phone' AS father_phone,
  s.parent->'father'->>'email' AS father_email,
  s.parent->'father'->>'occupation' AS father_occupation,
  (s.parent->'father'->>'income')::numeric AS father_income,
  -- parent (mother)
  s.parent->'mother'->>'name' AS mother_name,
  s.parent->'mother'->>'cnic' AS mother_cnic,
  s.parent->'mother'->>'phone' AS mother_phone,
  s.parent->'mother'->>'email' AS mother_email,
  s.parent->'mother'->>'occupation' AS mother_occupation,
  (s.parent->'mother'->>'income')::numeric AS mother_income,
  -- guardian
  s.parent->'guardian'->>'name' AS guardian_name,
  s.parent->'guardian'->>'relationship' AS guardian_relationship,
  s.parent->'guardian'->>'phone' AS guardian_phone,
  s.parent->'guardian'->>'cnic' AS guardian_cnic,
  -- emergency
  s.parent->'emergency'->>'name' AS emergency_name,
  s.parent->'emergency'->>'phone' AS emergency_phone,
  s.parent->'emergency'->>'relationship' AS emergency_relationship,
  s.parent->>'familySize' AS family_size,
  s.parent->>'familyNotes' AS family_notes,
  -- transport
  (s.transport->>'usesTransport')::boolean AS transport_uses_transport,
  s.transport->>'busNumber' AS transport_bus_number,
  s.transport->>'route' AS transport_route,
  s.transport->>'pickupPoint' AS transport_pickup_point,
  s.transport->>'dropPoint' AS transport_drop_point,
  s.transport->>'pickupTime' AS transport_pickup_time,
  s.transport->>'dropTime' AS transport_drop_time,
  s.transport->>'notes' AS transport_notes,
  s.transport->>'feeCategory' AS transport_fee_category,
  s.transport->>'alternativeMode' AS transport_alternative_mode,
  s.transport->>'vanServiceProvider' AS transport_van_service_provider,
  s.transport->>'vanDriverContact' AS transport_van_driver_contact,
  -- fee
  s.fee->>'feePlan' AS fee_plan,
  s.fee->>'academicYear' AS fee_academic_year,
  (s.fee->>'isNewAdmission')::boolean AS fee_is_new_admission,
  (s.fee->>'tuitionFee')::numeric AS fee_tuition_fee,
  (s.fee->>'admissionFee')::numeric AS fee_admission_fee,
  (s.fee->>'transportFee')::numeric AS fee_transport_fee,
  (s.fee->>'libraryFee')::numeric AS fee_library_fee,
  (s.fee->>'labFee')::numeric AS fee_lab_fee,
  (s.fee->>'examFee')::numeric AS fee_exam_fee,
  (s.fee->>'activityFee')::numeric AS fee_activity_fee,
  s.fee->'discount'->>'type' AS fee_discount_type,
  (s.fee->'discount'->>'value')::numeric AS fee_discount_value,
  s.fee->'discount'->>'reason' AS fee_discount_reason,
  s.fee->'discount'->>'approvedBy' AS fee_discount_approved_by,
  s.fee->>'paymentSchedule' AS fee_payment_schedule,
  s.fee->>'firstPaymentDue' AS fee_first_payment_due,
  s.fee->'paymentMethods' AS fee_payment_methods
FROM students s;

-- Map class sections to subjects with per-subject full marks/grade scheme
CREATE TABLE IF NOT EXISTS class_subjects (
  id SERIAL PRIMARY KEY,
  class_section_id INTEGER NOT NULL REFERENCES class_sections(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  full_marks INTEGER,
  grade_scheme TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (class_section_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON class_subjects(class_section_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject ON class_subjects(subject_id);

-- Grading schemes for grade band thresholds
CREATE TABLE IF NOT EXISTS grading_schemes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Default',
  academic_year TEXT DEFAULT '',
  bands JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., {"A":80,"B":70,"C":60,"D":50}
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grading_schemes_default ON grading_schemes(is_default);

-- ============================================
-- UNIFIED ROLE-BASED FINANCE SYSTEM
-- Supports: Students, Teachers, Drivers
-- ============================================

-- Drivers table (replacing driver_name TEXT in buses)
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  license_number TEXT UNIQUE,
  license_expiry DATE,
  national_id TEXT,
  address TEXT,
  bus_id INTEGER REFERENCES buses(id) ON DELETE SET NULL,
  base_salary NUMERIC(12,2) DEFAULT 0,
  allowances NUMERIC(12,2) DEFAULT 0,
  deductions NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'bank' CHECK (payment_method IN ('bank','cash','cheque','other')),
  bank_name TEXT,
  account_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','on_leave')),
  avatar TEXT,
  joining_date DATE DEFAULT CURRENT_DATE,
  campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Backfill columns for existing deployments
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS license_number TEXT,
  ADD COLUMN IF NOT EXISTS license_expiry DATE,
  ADD COLUMN IF NOT EXISTS national_id TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS bus_id INTEGER,
  ADD COLUMN IF NOT EXISTS base_salary NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS allowances NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deductions NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank',
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS avatar TEXT,
  ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Link drivers to users table for per-user authentication
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'drivers_user_id_key'
  ) THEN
    ALTER TABLE drivers ADD CONSTRAINT drivers_user_id_key UNIQUE (user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);

CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_bus ON drivers(bus_id);

-- Driver Payrolls (similar to teacher_payrolls)
CREATE TABLE IF NOT EXISTS driver_payrolls (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  period_month DATE NOT NULL,
  base_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  allowances NUMERIC(12,2) NOT NULL DEFAULT 0,
  deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  bonuses NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed','cancelled')),
  payment_method TEXT,
  bank_name TEXT,
  account_title TEXT,
  account_number TEXT,
  iban TEXT,
  cheque_number TEXT,
  transaction_reference TEXT,
  paid_on TIMESTAMP,
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (driver_id, period_month)
);

CREATE INDEX IF NOT EXISTS idx_driver_payrolls_period ON driver_payrolls(period_month);
CREATE INDEX IF NOT EXISTS idx_driver_payrolls_status ON driver_payrolls(status);

-- Unified Finance Invoices (supports Students, Teachers, Drivers)
CREATE TABLE IF NOT EXISTS finance_invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('student','teacher','driver')),
  user_id INTEGER NOT NULL,
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('fee','salary','allowance','deduction','other')),
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  tax NUMERIC(12,2) DEFAULT 0,
  discount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  balance NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','partial','paid','overdue','cancelled')),
  due_date DATE,
  period_month DATE,
  issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_invoices_user ON finance_invoices(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_status ON finance_invoices(status);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_type ON finance_invoices(invoice_type);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_due ON finance_invoices(due_date);

-- Unified Finance Payments
CREATE TABLE IF NOT EXISTS finance_payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES finance_invoices(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('student','teacher','driver')),
  user_id INTEGER NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT CHECK (method IN ('cash','bank','online','cheque','other')),
  reference_number TEXT,
  notes TEXT,
  paid_at TIMESTAMP NOT NULL DEFAULT NOW(),
  received_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_payments_invoice ON finance_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_finance_payments_user ON finance_payments(user_type, user_id);

-- Finance Receipts
CREATE TABLE IF NOT EXISTS finance_receipts (
  id SERIAL PRIMARY KEY,
  receipt_number TEXT UNIQUE,
  payment_id INTEGER NOT NULL REFERENCES finance_payments(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('student','teacher','driver')),
  user_id INTEGER NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
  printed_at TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_finance_receipts_payment ON finance_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_finance_receipts_user ON finance_receipts(user_type, user_id);

-- Migrate existing fee_invoices to finance_invoices (preserving data)
INSERT INTO finance_invoices (user_type, user_id, invoice_type, amount, total, balance, status, due_date, issued_at, created_at, updated_at)
SELECT 
  'student' AS user_type,
  student_id AS user_id,
  'fee' AS invoice_type,
  amount,
  amount AS total,
  CASE WHEN status = 'paid' THEN 0 ELSE amount END AS balance,
  CASE 
    WHEN status = 'paid' THEN 'paid'
    WHEN status = 'overdue' THEN 'overdue'
    WHEN status = 'in_progress' THEN 'partial'
    ELSE 'pending'
  END AS status,
  due_date,
  issued_at,
  issued_at AS created_at,
  NOW() AS updated_at
FROM fee_invoices
WHERE NOT EXISTS (
  SELECT 1 FROM finance_invoices fi 
  WHERE fi.user_type = 'student' 
  AND fi.user_id = fee_invoices.student_id 
  AND fi.invoice_type = 'fee'
  AND fi.issued_at = fee_invoices.issued_at
);

-- Migrate existing fee_payments to finance_payments
INSERT INTO finance_payments (invoice_id, user_type, user_id, amount, method, paid_at, created_at)
SELECT 
  fi.id AS invoice_id,
  'student' AS user_type,
  fo.student_id AS user_id,
  fp.amount,
  CASE 
    WHEN LOWER(COALESCE(fp.method,'')) IN ('cash','bank','online','cheque','other') THEN LOWER(fp.method)
    ELSE 'other'
  END AS method,
  fp.paid_at,
  fp.paid_at AS created_at
FROM fee_payments fp
JOIN fee_invoices fo ON fp.invoice_id = fo.id
JOIN finance_invoices fi ON fi.user_type = 'student' AND fi.user_id = fo.student_id AND fi.invoice_type = 'fee'
WHERE NOT EXISTS (
  SELECT 1 FROM finance_payments efp 
  WHERE efp.user_type = 'student' 
  AND efp.user_id = fo.student_id 
  AND efp.amount = fp.amount
  AND efp.paid_at = fp.paid_at
);

-- Generate invoice numbers for migrated records
UPDATE finance_invoices 
SET invoice_number = 'INV-' || LPAD(id::text, 6, '0')
WHERE invoice_number IS NULL;

-- Generate receipt numbers for existing payments
INSERT INTO finance_receipts (receipt_number, payment_id, user_type, user_id, amount, issued_at)
SELECT 
  'RCT-' || LPAD(fp.id::text, 6, '0'),
  fp.id,
  fp.user_type,
  fp.user_id,
  fp.amount,
  fp.paid_at
FROM finance_payments fp
WHERE NOT EXISTS (
  SELECT 1 FROM finance_receipts fr WHERE fr.payment_id = fp.id
);

-- ========================================
-- EXPENSES (Operational)
-- ========================================

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  vendor TEXT,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Paid','Rejected')),
  receipt TEXT,
  note TEXT,
  logs JSONB DEFAULT '[]'::jsonb,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

