import { query } from '../config/db.js';

const getTeacherCampusId = async (teacherId) => {
  const { rows } = await query('SELECT campus_id FROM teachers WHERE id = $1', [teacherId]);
  return rows[0]?.campus_id ? Number(rows[0].campus_id) : null;
};

const teacherSelect = `
  id,
  name,
  email,
  phone,
  qualification,
  gender,
  dob,
  blood_group AS "bloodGroup",
  religion,
  national_id AS "nationalId",
  address_line1 AS "address1",
  address_line2 AS "address2",
  city,
  state,
  postal_code AS "postalCode",
  emergency_name AS "emergencyName",
  emergency_phone AS "emergencyPhone",
  emergency_relation AS "emergencyRelation",
  employment_type AS "employmentType",
  joining_date AS "joiningDate",
  employee_id AS "employeeId",
  department,
  designation,
  experience_years AS "experienceYears",
  specialization,
  subject,
  subjects,
  classes,
  employment_status AS "employmentStatus",
  status,
  probation_end_date AS "probationEndDate",
  contract_end_date AS "contractEndDate",
  work_hours_per_week AS "workHoursPerWeek",
  base_salary AS "baseSalary",
  allowances,
  deductions,
  salary,
  currency,
  pay_frequency AS "payFrequency",
  payment_method AS "paymentMethod",
  bank_name AS "bankName",
  account_number AS "accountNumber",
  iban,
  avatar,
  created_at AS "createdAt",
  updated_at AS "updatedAt",
  campus_id AS "campusId"
`;

const scheduleSelect = `
  ts.id,
  ts.teacher_id AS "teacherId",
  t.name AS "teacherName",
  t.employee_id AS "employeeId",
  ts.day_of_week AS "dayOfWeek",
  ts.start_time AS "startTime",
  ts.end_time AS "endTime",
  ts.class AS "className",
  ts.section,
  ts.subject,
  ts.room,
  ts.time_slot_index AS "timeSlotIndex",
  ts.time_slot_label AS "timeSlotLabel",
  ts.created_at AS "createdAt",
  ts.updated_at AS "updatedAt"
`;

const attendanceSelect = `
  ta.id,
  COALESCE(ta.teacher_id, t.id) AS "teacherId",
  ta.attendance_date AS "date",
  ta.status,
  ta.check_in_time AS "checkInTime",
  ta.check_out_time AS "checkOutTime",
  ta.remarks,
  ta.recorded_by AS "recordedBy",
  ta.created_at AS "createdAt",
  ta.updated_at AS "updatedAt",
  t.name AS "teacherName",
  t.employee_id AS "employeeId",
  t.department
`;

const payrollSelect = `
  tp.id,
  tp.teacher_id AS "teacherId",
  t.name AS "teacherName",
  t.employee_id AS "employeeId",
  t.designation,
  tp.period_month AS "periodMonth",
  tp.base_salary AS "baseSalary",
  tp.allowances,
  tp.deductions,
  tp.bonuses,
  tp.total_amount AS "totalAmount",
  tp.status,
  tp.payment_method AS "paymentMethod",
  tp.bank_name AS "bankName",
  tp.account_title AS "accountTitle",
  tp.account_number AS "accountNumber",
  tp.iban AS "iban",
  tp.cheque_number AS "chequeNumber",
  tp.transaction_reference AS "transactionReference",
  tp.paid_on AS "paidOn",
  tp.notes,
  tp.created_at AS "createdAt",
  tp.updated_at AS "updatedAt"
`;

const performanceSelect = `
  pr.id,
  pr.teacher_id AS "teacherId",
  t.name AS "teacherName",
  t.employee_id AS "employeeId",
  t.subject,
  pr.period_type AS "periodType",
  pr.period_label AS "periodLabel",
  pr.period_start AS "periodStart",
  pr.period_end AS "periodEnd",
  pr.overall_score AS "overallScore",
  pr.student_feedback_score AS "studentFeedbackScore",
  pr.attendance_score AS "attendanceScore",
  pr.class_management_score AS "classManagementScore",
  pr.exam_results_score AS "examResultsScore",
  pr.status,
  pr.improvement,
  pr.remarks,
  pr.created_at AS "createdAt",
  pr.updated_at AS "updatedAt"
`;

const subjectAssignmentSelect = `
  tsa.id,
  tsa.teacher_id AS "teacherId",
  t.name AS "teacherName",
  t.employee_id AS "employeeId",
  t.department,
  t.designation,
  tsa.subject_id AS "subjectId",
  s.name AS "subjectName",
  s.code AS "subjectCode",
  s.department AS "subjectDepartment",
  tsa.is_primary AS "isPrimary",
  tsa.classes,
  tsa.academic_year AS "academicYear",
  tsa.assigned_by AS "assignedBy",
  tsa.assigned_at AS "assignedAt",
  tsa.updated_at AS "updatedAt"
`;

const columnMap = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  qualification: 'qualification',
  gender: 'gender',
  dob: 'dob',
  bloodGroup: 'blood_group',
  religion: 'religion',
  nationalId: 'national_id',
  address1: 'address_line1',
  address2: 'address_line2',
  city: 'city',
  state: 'state',
  postalCode: 'postal_code',
  emergencyName: 'emergency_name',
  emergencyPhone: 'emergency_phone',
  emergencyRelation: 'emergency_relation',
  employmentType: 'employment_type',
  joiningDate: 'joining_date',
  employeeId: 'employee_id',
  department: 'department',
  designation: 'designation',
  experienceYears: 'experience_years',
  specialization: 'specialization',
  subject: 'subject',
  subjects: 'subjects',
  classes: 'classes',
  employmentStatus: 'employment_status',
  status: 'status',
  probationEndDate: 'probation_end_date',
  contractEndDate: 'contract_end_date',
  workHoursPerWeek: 'work_hours_per_week',
  baseSalary: 'base_salary',
  allowances: 'allowances',
  deductions: 'deductions',
  salary: 'salary',
  currency: 'currency',
  payFrequency: 'pay_frequency',
  paymentMethod: 'payment_method',
  bankName: 'bank_name',
  accountNumber: 'account_number',
  iban: 'iban',
  avatar: 'avatar',
  userId: 'user_id',
  campusId: 'campus_id',
};

const jsonColumns = new Set(['subjects', 'classes']);
const netFields = ['baseSalary', 'allowances', 'deductions'];

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const attendanceStatuses = new Set(['present', 'absent', 'late']);
const payrollStatuses = new Set(['pending', 'processing', 'paid', 'failed', 'cancelled']);

const normalizeDayOfWeek = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 7) return value;
  if (typeof value === 'string') {
    const numeric = Number(value);
    if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 7) return numeric;
    const idx = dayNames.findIndex((day) => day.toLowerCase() === value.toLowerCase());
    if (idx >= 0) return idx + 1;
  }
  return null;
};

const formatMonthToDate = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}$/.test(str)) return `${str}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return `${str.slice(0, 7)}-01`;
  return null;
};

const mapTeacherRow = (row = {}) => ({
  ...row,
  subjects: Array.isArray(row.subjects) ? row.subjects : [],
  classes: Array.isArray(row.classes) ? row.classes : [],
});

const mapScheduleRow = (row = {}) => ({
  id: row.id,
  teacherId: row.teacherId,
  teacherName: row.teacherName,
  employeeId: row.employeeId,
  dayOfWeek: row.dayOfWeek,
  dayName: dayNames[row.dayOfWeek - 1] || null,
  startTime: row.startTime,
  endTime: row.endTime,
  class: row.className,
  section: row.section,
  subject: row.subject,
  room: row.room,
  timeSlotIndex: row.timeSlotIndex,
  timeSlotLabel: row.timeSlotLabel,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapAttendanceRow = (row = {}) => ({
  id: row.id,
  teacherId: row.teacherId,
  teacherName: row.teacherName,
  employeeId: row.employeeId,
  department: row.department,
  date: row.date,
  status: row.status,
  checkInTime: row.checkInTime,
  checkOutTime: row.checkOutTime,
  remarks: row.remarks,
  recordedBy: row.recordedBy,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapPayrollRow = (row = {}) => ({
  ...row,
  periodMonth: row.periodMonth,
});

const mapPerformanceRow = (row = {}) => ({
  ...row,
});

const subjectDetailSelect = `
  id,
  name,
  code,
  department,
  description,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const mapSubjectRow = (row = {}) => ({
  id: row.id,
  name: row.name,
  code: row.code,
  department: row.department,
  description: row.description,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapSubjectAssignmentRow = (row = {}) => ({
  ...row,
  classes:
    Array.isArray(row.classes)
      ? row.classes
      : typeof row.classes === 'string'
        ? (() => {
          try {
            const parsed = JSON.parse(row.classes);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            return [];
          }
        })()
        : [],
});

const getSubjectById = async (id) => {
  const { rows } = await query(`SELECT ${subjectDetailSelect} FROM subjects WHERE id = $1`, [id]);
  return rows[0] ? mapSubjectRow(rows[0]) : null;
};

const getSubjectAssignmentById = async (id) => {
  const { rows } = await query(
    `SELECT ${subjectAssignmentSelect}
       FROM teacher_subject_assignments tsa
       JOIN teachers t ON t.id = tsa.teacher_id
       JOIN subjects s ON s.id = tsa.subject_id
      WHERE tsa.id = $1`,
    [id]
  );
  return rows[0] ? mapSubjectAssignmentRow(rows[0]) : null;
};

const getScheduleSlotById = async (id) => {
  const { rows } = await query(
    `SELECT ${scheduleSelect}
       FROM teacher_schedules ts
       JOIN teachers t ON t.id = ts.teacher_id
      WHERE ts.id = $1`,
    [id]
  );
  return rows[0] ? mapScheduleRow(rows[0]) : null;
};

const getPayrollById = async (id) => {
  const { rows } = await query(
    `SELECT ${payrollSelect}
       FROM teacher_payrolls tp
       JOIN teachers t ON t.id = tp.teacher_id
      WHERE tp.id = $1`,
    [id]
  );
  return rows[0] ? mapPayrollRow(rows[0]) : null;
};

const getPerformanceById = async (id) => {
  const { rows } = await query(
    `SELECT ${performanceSelect}
       FROM teacher_performance_reviews pr
       JOIN teachers t ON t.id = pr.teacher_id
      WHERE pr.id = $1`,
    [id]
  );
  return rows[0] ? mapPerformanceRow(rows[0]) : null;
};

const computeNetSalary = ({ baseSalary = 0, allowances = 0, deductions = 0 }) => {
  const net = Number(baseSalary || 0) + Number(allowances || 0) - Number(deductions || 0);
  return Math.max(0, Number(net.toFixed(2)));
};

const computePayrollTotal = ({ baseSalary = 0, allowances = 0, deductions = 0, bonuses = 0 }) => {
  const total = Number(baseSalary || 0) + Number(allowances || 0) + Number(bonuses || 0) - Number(deductions || 0);
  return Math.max(0, Number(total.toFixed(2)));
};

export const list = async ({ page = 1, pageSize = 50, q, campusId }) => {
  const offset = (page - 1) * pageSize;
  const params = [];
  const where = [];
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(employee_id) LIKE $${params.length})`);
  }
  if (campusId) {
    params.push(campusId);
    where.push(`campus_id = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS count FROM teachers ${whereSql}`, params);
  const total = countRows[0]?.count || 0;

  const { rows } = await query(
    `SELECT ${teacherSelect} FROM teachers ${whereSql} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, offset]
  );
  return { rows: rows.map(mapTeacherRow), total, page, pageSize };
};

export const getById = async (id) => {
  const { rows } = await query(`SELECT ${teacherSelect} FROM teachers WHERE id = $1`, [id]);
  return rows[0] ? mapTeacherRow(rows[0]) : null;
};

export const getByUserId = async (userId) => {
  const { rows } = await query(`SELECT ${teacherSelect} FROM teachers WHERE user_id = $1`, [userId]);
  return rows[0] ? mapTeacherRow(rows[0]) : null;
};

export const getTeachingScopesByUserId = async (userId) => {
  const { rows } = await query(
    `SELECT DISTINCT ts.class AS "className", ts.section
     FROM teacher_schedules ts
     JOIN teachers t ON t.id = ts.teacher_id
     WHERE t.user_id = $1
       AND COALESCE(NULLIF(TRIM(ts.class), ''), '') <> ''
     ORDER BY ts.class, ts.section`,
    [Number(userId)]
  );
  return rows.map((r) => ({
    className: r.className,
    section: r.section || null,
  }));
};

export const getSchedule = async (id) => {
  const { rows } = await query(
    `SELECT ${scheduleSelect} FROM teacher_schedules ts
      JOIN teachers t ON t.id = ts.teacher_id
     WHERE ts.teacher_id = $1
     ORDER BY ts.day_of_week, ts.start_time`,
    [id]
  );
  return rows.map(mapScheduleRow);
};

export const create = async (payload = {}) => {
  const data = { ...payload };
  data.employmentType = data.employmentType || 'fullTime';
  data.employmentStatus = data.employmentStatus || 'active';
  data.status = data.status || data.employmentStatus;
  data.currency = data.currency || 'PKR';
  data.payFrequency = data.payFrequency || 'monthly';
  data.paymentMethod = data.paymentMethod || 'bank';
  data.subjects = Array.isArray(data.subjects) ? data.subjects : [];
  data.classes = Array.isArray(data.classes) ? data.classes : [];
  data.baseSalary = data.baseSalary ?? 0;
  data.allowances = data.allowances ?? 0;
  data.deductions = data.deductions ?? 0;
  data.subject = data.subject || data.specialization || (data.subjects.length ? data.subjects[0] : null);
  data.salary = computeNetSalary(data);

  const insertFields = [
    // Personal & contact
    'name', 'email', 'phone', 'qualification', 'gender', 'dob', 'bloodGroup', 'religion', 'nationalId',
    'address1', 'address2', 'city', 'state', 'postalCode', 'emergencyName', 'emergencyPhone', 'emergencyRelation',
    // Professional
    'employmentType', 'joiningDate', 'employeeId', 'department', 'designation', 'experienceYears', 'specialization',
    'employmentStatus', 'status', 'probationEndDate', 'contractEndDate', 'workHoursPerWeek',
    // Teaching scope
    'subjects', 'classes', 'subject',
    // Compensation
    'baseSalary', 'allowances', 'deductions', 'salary',
    // Payment
    'currency', 'payFrequency', 'paymentMethod', 'bankName', 'accountNumber', 'iban',
    // Media
    'avatar',
    // Link to users
    'userId',
    // Multi-campus
    'campusId',
  ];

  const columns = insertFields.map((field) => columnMap[field]);
  const values = insertFields.map((field) => {
    if (jsonColumns.has(field)) return JSON.stringify(data[field] ?? []);
    return data[field] ?? null;
  });
  const placeholders = columns.map((_, idx) => `$${idx + 1}`);

  try {
    const { rows } = await query(
      `INSERT INTO teachers (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING ${teacherSelect}`,
      values
    );
    return mapTeacherRow(rows[0]);
  } catch (err) {
    // Map PG unique violations to user-friendly API errors
    if (err && err.code === '23505') {
      const e = new Error(
        err.constraint === 'teachers_email_key'
          ? 'Email already in use'
          : err.constraint === 'teachers_employee_id_key'
            ? 'Employee ID already in use'
            : 'Duplicate value violates unique constraint'
      );
      e.status = 409;
      throw e;
    }
    throw err;
  }
};

export const update = async (id, payload = {}) => {
  if (!payload || Object.keys(payload).length === 0) return await getById(id);

  const { rows } = await query('SELECT base_salary, allowances, deductions FROM teachers WHERE id = $1', [id]);
  if (!rows.length) return null;
  const current = rows[0];

  const data = { ...payload };
  if (data.employmentStatus && !data.status) data.status = data.employmentStatus;
  if (!data.subject && data.specialization) data.subject = data.specialization;
  if (!data.subject && Array.isArray(data.subjects) && data.subjects.length) data.subject = data.subjects[0];

  if (netFields.some((field) => field in data)) {
    const baseSalary = 'baseSalary' in data ? data.baseSalary : current.base_salary;
    const allowances = 'allowances' in data ? data.allowances : current.allowances;
    const deductions = 'deductions' in data ? data.deductions : current.deductions;
    data.salary = computeNetSalary({ baseSalary, allowances, deductions });
  }

  const sets = [];
  const values = [];
  Object.entries(data).forEach(([field, value]) => {
    if (!(field in columnMap)) return;
    const column = columnMap[field];
    const formattedValue = jsonColumns.has(field) ? JSON.stringify(value ?? []) : value;
    values.push(formattedValue);
    sets.push(`${column} = $${values.length}`);
  });

  if (!sets.length) return await getById(id);
  sets.push('updated_at = NOW()');
  values.push(id);

  const { rowCount } = await query(`UPDATE teachers SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
  if (!rowCount) return null;
  return await getById(id);
};

export const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM teachers WHERE id = $1', [id]);
  return rowCount > 0;
};

export const listSchedules = async ({ teacherId, dayOfWeek, className, section, campusId }) => {
  const params = [];
  const where = [];
  if (teacherId) {
    params.push(teacherId);
    where.push(`ts.teacher_id = $${params.length}`);
  }
  const normalizedDay = normalizeDayOfWeek(dayOfWeek);
  if (normalizedDay) {
    params.push(normalizedDay);
    where.push(`ts.day_of_week = $${params.length}`);
  }
  if (className) {
    params.push(className);
    where.push(`ts.class = $${params.length}`);
  }
  if (section) {
    params.push(section);
    where.push(`ts.section = $${params.length}`);
  }

  if (campusId) {
    params.push(Number(campusId));
    where.push(`t.campus_id = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${scheduleSelect}
       FROM teacher_schedules ts
       JOIN teachers t ON t.id = ts.teacher_id
       ${whereSql}
       ORDER BY ts.day_of_week, ts.start_time`,
    params
  );
  return rows.map(mapScheduleRow);
};

export const createScheduleSlot = async (payload = {}) => {
  const dayOfWeek = normalizeDayOfWeek(payload.dayOfWeek);
  if (!dayOfWeek) throw new Error('Invalid dayOfWeek');
  const values = [
    payload.teacherId,
    dayOfWeek,
    payload.startTime,
    payload.endTime,
    payload.class ?? payload.className ?? null,
    payload.section ?? null,
    payload.subject ?? null,
    payload.room ?? null,
    payload.timeSlotIndex ?? null,
    payload.timeSlotLabel ?? null,
  ];
  const { rows } = await query(
    `INSERT INTO teacher_schedules (teacher_id, day_of_week, start_time, end_time, class, section, subject, room, time_slot_index, time_slot_label)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    values
  );
  return await getScheduleSlotById(rows[0].id);
};

export const updateScheduleSlot = async (id, payload = {}) => {
  const updates = [];
  const values = [];

  if (payload.dayOfWeek !== undefined) {
    const normalized = normalizeDayOfWeek(payload.dayOfWeek);
    if (normalized) {
      values.push(normalized);
      updates.push(`day_of_week = $${values.length}`);
    }
  }

  const directMap = {
    startTime: 'start_time',
    endTime: 'end_time',
    class: 'class',
    className: 'class',
    section: 'section',
    subject: 'subject',
    room: 'room',
    timeSlotIndex: 'time_slot_index',
    timeSlotLabel: 'time_slot_label',
  };

  Object.entries(directMap).forEach(([field, column]) => {
    if (field in payload && payload[field] !== undefined) {
      values.push(payload[field]);
      updates.push(`${column} = $${values.length}`);
    }
  });

  if (!updates.length) {
    return await getScheduleSlotById(id);
  }

  updates.push('updated_at = NOW()');
  values.push(id);

  const { rows } = await query(
    `UPDATE teacher_schedules SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING id`,
    values
  );
  return rows[0] ? await getScheduleSlotById(rows[0].id) : null;
};

export const deleteScheduleSlot = async (id) => {
  const { rowCount } = await query('DELETE FROM teacher_schedules WHERE id = $1', [id]);
  return rowCount > 0;
};

export const getAttendanceByDate = async ({ date, teacherId, campusId }) => {
  const params = [date];
  let filter = '';
  if (teacherId) {
    params.push(teacherId);
    filter += ` AND t.id = $${params.length}`;
  }
  if (campusId) {
    params.push(campusId);
    filter += ` AND t.campus_id = $${params.length}`;
  }
  const { rows } = await query(
    `SELECT ${attendanceSelect}
       FROM teachers t
       LEFT JOIN teacher_attendance ta
         ON ta.teacher_id = t.id AND ta.attendance_date = $1
      WHERE t.status != 'resigned' ${filter}
      ORDER BY t.name`,
    params
  );
  return rows.map(mapAttendanceRow);
};

export const upsertAttendanceEntries = async ({ date, entries = [], recordedBy }) => {
  if (!entries.length) return await getAttendanceByDate({ date });
  const columns = ['teacher_id', 'attendance_date', 'status', 'check_in_time', 'check_out_time', 'remarks', 'recorded_by'];
  const values = [];
  const tuples = entries.map((entry, idx) => {
    values.push(
      entry.teacherId,
      date,
      entry.status,
      entry.checkInTime ?? null,
      entry.checkOutTime ?? null,
      entry.remarks ?? null,
      recordedBy ?? null
    );
    const placeholders = columns.map((_, colIdx) => `$${idx * columns.length + colIdx + 1}`);
    return `(${placeholders.join(', ')})`;
  });

  await query(
    `INSERT INTO teacher_attendance (${columns.join(', ')})
     VALUES ${tuples.join(', ')}
     ON CONFLICT (teacher_id, attendance_date)
     DO UPDATE SET
       status = EXCLUDED.status,
       check_in_time = EXCLUDED.check_in_time,
       check_out_time = EXCLUDED.check_out_time,
       remarks = EXCLUDED.remarks,
       recorded_by = EXCLUDED.recorded_by,
       updated_at = NOW()`,
    values
  );

  return await getAttendanceByDate({ date });
};

export const listPayrolls = async ({ month, teacherId, status, campusId }) => {
  const params = [];
  const where = [];
  const formattedMonth = formatMonthToDate(month);
  if (formattedMonth) {
    params.push(formattedMonth);
    where.push(`tp.period_month = $${params.length}`);
  }
  if (teacherId) {
    params.push(teacherId);
    where.push(`tp.teacher_id = $${params.length}`);
  }
  if (campusId) {
    params.push(campusId);
    where.push(`t.campus_id = $${params.length}`);
  }
  if (status && payrollStatuses.has(status)) {
    params.push(status);
    where.push(`tp.status = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${payrollSelect}
       FROM teacher_payrolls tp
       JOIN teachers t ON t.id = tp.teacher_id
       ${whereSql}
       ORDER BY tp.period_month DESC, t.name ASC`,
    params
  );
  return rows.map(mapPayrollRow);
};

export const createPayroll = async (payload = {}) => {
  const periodMonth = formatMonthToDate(payload.periodMonth || payload.month);
  if (!periodMonth) throw new Error('Invalid periodMonth');
  const baseSalary = Number(payload.baseSalary ?? 0);
  const allowances = Number(payload.allowances ?? 0);
  const deductions = Number(payload.deductions ?? 0);
  const bonuses = Number(payload.bonuses ?? 0);
  const totalAmount = computePayrollTotal({ baseSalary, allowances, deductions, bonuses });
  const status = payrollStatuses.has(payload.status) ? payload.status : 'pending';

  const values = [
    payload.teacherId,
    periodMonth,
    baseSalary,
    allowances,
    deductions,
    bonuses,
    totalAmount,
    status,
    payload.paymentMethod ?? null,
    payload.bankName ?? null,
    payload.accountTitle ?? null,
    payload.accountNumber ?? null,
    payload.iban ?? null,
    payload.chequeNumber ?? null,
    payload.transactionReference ?? null,
    payload.paidOn ?? null,
    payload.notes ?? null,
    payload.createdBy ?? null,
  ];

  const { rows } = await query(
    `INSERT INTO teacher_payrolls (teacher_id, period_month, base_salary, allowances, deductions, bonuses, total_amount, status, payment_method, bank_name, account_title, account_number, iban, cheque_number, transaction_reference, paid_on, notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     ON CONFLICT ON CONSTRAINT teacher_payrolls_teacher_id_period_month_key
     DO UPDATE SET
       base_salary = EXCLUDED.base_salary,
       allowances = EXCLUDED.allowances,
       deductions = EXCLUDED.deductions,
       bonuses = EXCLUDED.bonuses,
       total_amount = EXCLUDED.total_amount,
       status = EXCLUDED.status,
       payment_method = EXCLUDED.payment_method,
       bank_name = EXCLUDED.bank_name,
       account_title = EXCLUDED.account_title,
       account_number = EXCLUDED.account_number,
       iban = EXCLUDED.iban,
       cheque_number = EXCLUDED.cheque_number,
       transaction_reference = EXCLUDED.transaction_reference,
       paid_on = EXCLUDED.paid_on,
       notes = EXCLUDED.notes,
       created_by = COALESCE(teacher_payrolls.created_by, EXCLUDED.created_by),
       updated_at = NOW()
     RETURNING id`,
    values
  );
  return await getPayrollById(rows[0].id);
};

export const updatePayroll = async (id, payload = {}) => {
  const { rows: existingRows } = await query('SELECT * FROM teacher_payrolls WHERE id = $1', [id]);
  if (!existingRows.length) return null;
  const current = existingRows[0];

  const updates = [];
  const values = [];

  if (payload.periodMonth) {
    const periodMonth = formatMonthToDate(payload.periodMonth);
    if (periodMonth) {
      values.push(periodMonth);
      updates.push(`period_month = $${values.length}`);
    }
  }

  ['baseSalary', 'allowances', 'deductions', 'bonuses'].forEach((field) => {
    if (field in payload) {
      values.push(Number(payload[field] ?? 0));
      updates.push(`${field.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())} = $${values.length}`);
    }
  });

  if ('status' in payload && payrollStatuses.has(payload.status)) {
    values.push(payload.status);
    updates.push(`status = $${values.length}`);
  }
  if ('paymentMethod' in payload) {
    values.push(payload.paymentMethod ?? null);
    updates.push(`payment_method = $${values.length}`);
  }
  if ('bankName' in payload) {
    values.push(payload.bankName ?? null);
    updates.push(`bank_name = $${values.length}`);
  }
  if ('accountTitle' in payload) {
    values.push(payload.accountTitle ?? null);
    updates.push(`account_title = $${values.length}`);
  }
  if ('accountNumber' in payload) {
    values.push(payload.accountNumber ?? null);
    updates.push(`account_number = $${values.length}`);
  }
  if ('iban' in payload) {
    values.push(payload.iban ?? null);
    updates.push(`iban = $${values.length}`);
  }
  if ('chequeNumber' in payload) {
    values.push(payload.chequeNumber ?? null);
    updates.push(`cheque_number = $${values.length}`);
  }
  if ('transactionReference' in payload) {
    values.push(payload.transactionReference ?? null);
    updates.push(`transaction_reference = $${values.length}`);
  }
  if ('paidOn' in payload) {
    values.push(payload.paidOn ?? null);
    updates.push(`paid_on = $${values.length}`);
  }
  if ('notes' in payload) {
    values.push(payload.notes ?? null);
    updates.push(`notes = $${values.length}`);
  }

  if (!updates.length) {
    return await getPayrollById(id);
  }

  const baseSalary = 'baseSalary' in payload ? Number(payload.baseSalary ?? 0) : Number(current.base_salary ?? 0);
  const allowances = 'allowances' in payload ? Number(payload.allowances ?? 0) : Number(current.allowances ?? 0);
  const deductions = 'deductions' in payload ? Number(payload.deductions ?? 0) : Number(current.deductions ?? 0);
  const bonuses = 'bonuses' in payload ? Number(payload.bonuses ?? 0) : Number(current.bonuses ?? 0);
  const totalAmount = computePayrollTotal({ baseSalary, allowances, deductions, bonuses });

  values.push(totalAmount);
  updates.push(`total_amount = $${values.length}`);
  updates.push('updated_at = NOW()');
  values.push(id);

  const { rows } = await query(
    `UPDATE teacher_payrolls SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING id`,
    values
  );
  return rows[0] ? await getPayrollById(rows[0].id) : null;
};

export const deletePayroll = async (id) => {
  const { rows } = await query('DELETE FROM teacher_payrolls WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
};

export const listPerformanceReviews = async ({ periodType, teacherId }) => {
  const params = [];
  const where = [];
  if (periodType) {
    params.push(periodType);
    where.push(`pr.period_type = $${params.length}`);
  }
  if (teacherId) {
    params.push(teacherId);
    where.push(`pr.teacher_id = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${performanceSelect}
       FROM teacher_performance_reviews pr
       JOIN teachers t ON t.id = pr.teacher_id
       ${whereSql}
       ORDER BY pr.created_at DESC`,
    params
  );
  return rows.map(mapPerformanceRow);
};

export const createPerformanceReview = async (payload = {}) => {
  const values = [
    payload.teacherId,
    payload.periodType,
    payload.periodLabel ?? null,
    payload.periodStart ?? null,
    payload.periodEnd ?? null,
    payload.overallScore ?? null,
    payload.studentFeedbackScore ?? null,
    payload.attendanceScore ?? null,
    payload.classManagementScore ?? null,
    payload.examResultsScore ?? null,
    payload.status ?? null,
    payload.improvement ?? null,
    payload.remarks ?? null,
    payload.createdBy ?? null,
  ];

  const { rows } = await query(
    `INSERT INTO teacher_performance_reviews (
        teacher_id,
        period_type,
        period_label,
        period_start,
        period_end,
        overall_score,
        student_feedback_score,
        attendance_score,
        class_management_score,
        exam_results_score,
        status,
        improvement,
        remarks,
        created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING id`,
    values
  );
  return await getPerformanceById(rows[0].id);
};

export const updatePerformanceReview = async (id, payload = {}) => {
  if (!payload || Object.keys(payload).length === 0) {
    return await getPerformanceById(id);
  }

  const mappings = {
    teacherId: 'teacher_id',
    periodType: 'period_type',
    periodLabel: 'period_label',
    periodStart: 'period_start',
    periodEnd: 'period_end',
    overallScore: 'overall_score',
    studentFeedbackScore: 'student_feedback_score',
    attendanceScore: 'attendance_score',
    classManagementScore: 'class_management_score',
    examResultsScore: 'exam_results_score',
    status: 'status',
    improvement: 'improvement',
    remarks: 'remarks',
  };

  const updates = [];
  const values = [];
  Object.entries(mappings).forEach(([field, column]) => {
    if (field in payload) {
      const val = field === 'academicYear' ? (payload[field] ?? '') : payload[field];
      values.push(val);
      updates.push(`${column} = $${values.length}`);
    }
  });

  if (!updates.length) return await updatePerformanceReview(id, {});

  updates.push('updated_at = NOW()');
  values.push(id);

  const { rows } = await query(
    `UPDATE teacher_performance_reviews SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING id`,
    values
  );
  return rows[0] ? await getPerformanceById(rows[0].id) : null;
};

export const listSubjects = async ({ campusId } = {}) => {
  const scopedCampusId = campusId ? Number(campusId) : null;
  const { rows } = await query(
    `SELECT
        s.id,
        s.name,
        s.code,
        s.department,
        s.description,
        s.created_at AS "createdAt",
        s.updated_at AS "updatedAt",
        COALESCE(COUNT(tsa.id) FILTER (WHERE t.id IS NOT NULL), 0)::int AS "teacherCount",
        COALESCE(COUNT(tsa.id) FILTER (WHERE tsa.is_primary AND t.id IS NOT NULL), 0)::int AS "primaryTeacherCount"
     FROM subjects s
     LEFT JOIN teacher_subject_assignments tsa ON tsa.subject_id = s.id
     LEFT JOIN teachers t ON t.id = tsa.teacher_id AND ($1::int IS NULL OR t.campus_id = $1)
     GROUP BY s.id
     ORDER BY s.name ASC`,
    [scopedCampusId]
  );
  return rows;
};

export const listSubjectsByClass = async ({ className, section, campusId }) => {
  const params = [];
  const where = [];
  // Match by class name in classes JSONB
  if (className) {
    params.push(JSON.stringify([className]));
    where.push(`tsa.classes @> $${params.length}::jsonb`);
  }
  // Try class-section combined as well, if provided
  if (className && section) {
    params.push(JSON.stringify([`${className}-${section}`]));
    where.push(`tsa.classes @> $${params.length}::jsonb`);
  }
  const whereSql = where.length ? `WHERE (${where.join(' OR ')})` : '';
  const campusFilter = campusId ? `AND t.campus_id = $${params.length + 1}` : '';
  const finalParams = campusId ? [...params, Number(campusId)] : params;
  const { rows } = await query(
    `SELECT DISTINCT s.id, s.name, s.code, s.department, s.description
       FROM teacher_subject_assignments tsa
       JOIN subjects s ON s.id = tsa.subject_id
       JOIN teachers t ON t.id = tsa.teacher_id
       ${whereSql}
       ${whereSql ? '' : 'WHERE 1=1'}
       ${campusFilter}
       ORDER BY s.name ASC`,
    finalParams
  );
  return rows.map(r => ({ id: r.id, name: r.name, code: r.code, department: r.department, description: r.description }));
};

export const createSubject = async (payload = {}) => {
  const { rows } = await query(
    `INSERT INTO subjects (name, code, department, description)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (name)
     DO UPDATE SET
       code = EXCLUDED.code,
       department = EXCLUDED.department,
       description = EXCLUDED.description,
       updated_at = NOW()
     RETURNING id, name, code, department, description, created_at AS "createdAt", updated_at AS "updatedAt"`,
    [payload.name, payload.code ?? null, payload.department ?? null, payload.description ?? null]
  );
  return rows[0];
};

export const updateSubject = async (id, payload = {}) => {
  const existing = await getSubjectById(id);
  if (!existing) return null;
  const mappings = {
    name: 'name',
    code: 'code',
    department: 'department',
    description: 'description',
  };
  const updates = [];
  const values = [];
  Object.entries(mappings).forEach(([field, column]) => {
    if (field in payload) {
      values.push(payload[field] ?? null);
      updates.push(`${column} = $${values.length}`);
    }
  });
  if (!updates.length) return existing;
  updates.push('updated_at = NOW()');
  values.push(id);
  const { rows } = await query(
    `UPDATE subjects SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING ${subjectDetailSelect}`,
    values
  );
  return rows[0] ? mapSubjectRow(rows[0]) : null;
};

export const removeSubject = async (id) => {
  const { rowCount } = await query('DELETE FROM subjects WHERE id = $1', [id]);
  return rowCount > 0;
};

export const listSubjectAssignments = async ({ teacherId, subjectId, campusId }) => {
  const params = [];
  const where = [];
  if (teacherId) {
    params.push(teacherId);
    where.push(`tsa.teacher_id = $${params.length}`);
  }
  if (subjectId) {
    params.push(subjectId);
    where.push(`tsa.subject_id = $${params.length}`);
  }
  if (campusId) {
    params.push(Number(campusId));
    where.push(`t.campus_id = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${subjectAssignmentSelect}
       FROM teacher_subject_assignments tsa
       JOIN teachers t ON t.id = tsa.teacher_id
       JOIN subjects s ON s.id = tsa.subject_id
       ${whereSql}
       ORDER BY t.name`,
    params
  );
  return rows.map(mapSubjectAssignmentRow);
};

export const assignSubject = async (payload = {}) => {
  if (!payload.teacherId || !payload.subjectId) throw new Error('teacherId and subjectId are required');
  const teacherId = payload.teacherId;
  if (payload.isPrimary) {
    await query('UPDATE teacher_subject_assignments SET is_primary = FALSE WHERE teacher_id = $1', [teacherId]);
  }
  const { rows } = await query(
    `INSERT INTO teacher_subject_assignments (teacher_id, subject_id, is_primary, classes, academic_year, assigned_by)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT ON CONSTRAINT teacher_subject_assignments_unique
     DO UPDATE SET
       is_primary = EXCLUDED.is_primary,
       classes = EXCLUDED.classes,
       academic_year = EXCLUDED.academic_year,
       assigned_by = EXCLUDED.assigned_by,
       updated_at = NOW()
     RETURNING id`,
    [
      teacherId,
      payload.subjectId,
      Boolean(payload.isPrimary),
      JSON.stringify(payload.classes ?? []),
      payload.academicYear ?? '',
      payload.assignedBy ?? null,
    ]
  );
  return await getSubjectAssignmentById(rows[0].id);
};

export const updateSubjectAssignment = async (id, payload = {}) => {
  const existing = await getSubjectAssignmentById(id);
  if (!existing) return null;
  const updates = [];
  const values = [];
  const mappings = {
    teacherId: 'teacher_id',
    subjectId: 'subject_id',
    academicYear: 'academic_year',
    assignedBy: 'assigned_by',
  };
  Object.entries(mappings).forEach(([field, column]) => {
    if (field in payload) {
      values.push(payload[field]);
      updates.push(`${column} = $${values.length}`);
    }
  });
  if ('classes' in payload) {
    values.push(JSON.stringify(payload.classes ?? []));
    updates.push(`classes = $${values.length}`);
  }
  if ('isPrimary' in payload) {
    const flag = Boolean(payload.isPrimary);
    if (flag) {
      await query('UPDATE teacher_subject_assignments SET is_primary = FALSE WHERE teacher_id = $1', [payload.teacherId ?? existing.teacherId]);
    }
    values.push(flag);
    updates.push(`is_primary = $${values.length}`);
  }

  if (!updates.length) return existing;

  updates.push('updated_at = NOW()');
  values.push(id);

  const { rows } = await query(
    `UPDATE teacher_subject_assignments SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING id`,
    values
  );
  return rows[0] ? await getSubjectAssignmentById(rows[0].id) : null;
};

export const removeSubjectAssignment = async (id) => {
  const { rowCount } = await query('DELETE FROM teacher_subject_assignments WHERE id = $1', [id]);
  return rowCount > 0;
};

export const getMyClassesSummary = async (teacherId) => {
  const campusId = await getTeacherCampusId(teacherId);
  const { rows: classRows } = await query(
    `SELECT DISTINCT ts.class AS "className", ts.section
       FROM teacher_schedules ts
      WHERE ts.teacher_id = $1
        AND ts.class IS NOT NULL
        AND ts.section IS NOT NULL
      ORDER BY ts.class, ts.section`,
    [teacherId]
  );

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dayIdx = normalizeDayOfWeek(todayName);
  const nowTime = new Date().toTimeString().slice(0, 8);

  const out = [];
  for (const row of classRows) {
    const className = row.className;
    const section = row.section;

    const { rows: subjRows } = await query(
      `SELECT ts.subject, COUNT(*)::int AS c
         FROM teacher_schedules ts
        WHERE ts.teacher_id = $1 AND ts.class = $2 AND ts.section = $3
          AND ts.subject IS NOT NULL AND ts.subject <> ''
        GROUP BY ts.subject
        ORDER BY c DESC, ts.subject ASC
        LIMIT 1`,
      [teacherId, className, section]
    );
    const subject = subjRows[0]?.subject || null;

    let strength = 0;
    if (campusId) {
      const { rows: cntRows } = await query(
        `SELECT COUNT(*)::int AS c
           FROM students
          WHERE status = 'active'
            AND campus_id = $1
            AND class = $2
            AND section = $3`,
        [campusId, className, section]
      );
      strength = cntRows[0]?.c || 0;
    }

    let next = null;
    if (dayIdx) {
      const { rows: nextRows } = await query(
        `SELECT start_time AS "startTime"
           FROM teacher_schedules
          WHERE teacher_id = $1
            AND day_of_week = $2
            AND class = $3
            AND section = $4
            AND start_time > $5
          ORDER BY start_time ASC
          LIMIT 1`,
        [teacherId, dayIdx, className, section, nowTime]
      );
      next = nextRows[0]?.startTime || null;
    }

    out.push({
      id: `${className}-${section}`,
      className,
      section,
      subject,
      strength,
      next,
    });
  }
  return out;
};

export const getStudentsBySubject = async (teacherId, { q, grade, subject } = {}) => {
  const campusId = await getTeacherCampusId(teacherId);
  if (!campusId) return [];

  const params = [teacherId, campusId];
  const where = [
    'ts.teacher_id = $1',
    's.campus_id = $2',
    "s.status = 'active'",
    'ts.class IS NOT NULL',
    'ts.section IS NOT NULL',
    'ts.subject IS NOT NULL',
    "ts.subject <> ''",
  ];

  if (subject) {
    params.push(subject);
    where.push(`ts.subject = $${params.length}`);
  }
  if (grade) {
    params.push(grade);
    where.push(`s.class = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`(s.name ILIKE $${params.length} OR COALESCE(s.roll_number,'') ILIKE $${params.length})`);
  }

  const { rows } = await query(
    `SELECT DISTINCT
        ts.subject,
        s.id AS "studentId",
        s.name,
        s.roll_number AS "rollNumber",
        s.class AS "className",
        s.section,
        s.avatar
     FROM teacher_schedules ts
     JOIN students s
       ON s.class = ts.class
      AND s.section = ts.section
     WHERE ${where.join(' AND ')}
     ORDER BY ts.subject ASC, s.class ASC, s.section ASC, s.name ASC`,
    params
  );

  const by = new Map();
  for (const r of rows) {
    const key = r.subject || 'Unknown';
    if (!by.has(key)) by.set(key, []);
    by.get(key).push({
      id: r.studentId,
      name: r.name,
      rollNumber: r.rollNumber,
      className: r.className,
      section: r.section,
      avatar: r.avatar,
    });
  }

  return Array.from(by.entries()).map(([subj, students]) => ({ subject: subj, students }));
};
// Dashboard Stats
export const getDashboardStats = async (teacherId) => {
  const stats = {
    todaysClasses: 0,
    students: 0,
    attendancePending: 0,
    homeworkDue: 0,
    alerts: 0,
    upcomingClass: null,
    attendanceTrend: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [{ name: 'Attendance %', data: [0, 0, 0, 0, 0, 0, 0] }]
    },
    homeworkStats: {
      categories: [],
      series: [
        { name: 'Submitted', data: [] },
        { name: 'Pending', data: [] }
      ]
    }
  };

  try {
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const dayIdx = normalizeDayOfWeek(todayName);

    // 1. Today's Classes & Upcoming Class
    if (dayIdx) {
      const { rows: scheduleRows } = await query(
        `SELECT class AS "className", section, subject, room, start_time AS "startTime", end_time AS "endTime"
         FROM teacher_schedules
         WHERE teacher_id = $1 AND day_of_week = $2
         ORDER BY start_time ASC`,
        [teacherId, dayIdx]
      );
      stats.todaysClasses = scheduleRows.length;

      const nowTime = new Date().toTimeString().slice(0, 8);
      stats.upcomingClass = scheduleRows.find(r => r.startTime > nowTime) || null;
    }

    // 2. Total Students
    const { rows: classesRows } = await query(
      `SELECT DISTINCT class, section FROM teacher_schedules WHERE teacher_id = $1`,
      [teacherId]
    );

    let studentIds = [];
    if (classesRows.length > 0) {
      const conditions = classesRows.map((_, i) => `(class = $${i * 2 + 1} AND section = $${i * 2 + 2})`).join(' OR ');
      const params = [];
      classesRows.forEach(r => { params.push(r.class, r.section); });

      const { rows: studentRows } = await query(
        `SELECT id FROM students WHERE status = 'active' AND (${conditions})`,
        params
      );
      stats.students = studentRows.length;
      studentIds = studentRows.map(s => s.id);
    }

    // 3. Attendance Pending (Classes today with no attendance records)
    if (dayIdx && classesRows.length > 0) {
      const todayDate = new Date().toISOString().slice(0, 10);
      let pendingCount = 0;
      for (const cls of classesRows) {
        const { rows: attRows } = await query(
          `SELECT 1 FROM attendance_records ar
           JOIN students s ON s.id = ar.student_id
           WHERE s.class = $1 AND s.section = $2 AND ar.date = $3
           LIMIT 1`,
          [cls.class, cls.section, todayDate]
        );
        if (attRows.length === 0) pendingCount++;
      }
      stats.attendancePending = pendingCount;
    }

    // 4. Homework & Alerts
    const { rows: teacherUser } = await query('SELECT user_id FROM teachers WHERE id = $1', [teacherId]);
    if (teacherUser[0]?.user_id) {
      const userId = teacherUser[0].user_id;

      // Homework Due
      const { rows: hwRows } = await query(
        `SELECT COUNT(*)::int as count FROM assignments WHERE created_by = $1 AND due_date >= CURRENT_DATE`,
        [userId]
      );
      stats.homeworkDue = hwRows[0]?.count || 0;

      // Alerts
      const { rows: alertRows } = await query(
        `SELECT COUNT(*)::int as count FROM notifications WHERE user_id = $1 AND is_read = false`,
        [userId]
      );
      stats.alerts = alertRows[0]?.count || 0;

      // Homework Stats (Last 5 assignments)
      const { rows: assignments } = await query(
        `SELECT id, title FROM assignments WHERE created_by = $1 ORDER BY id DESC LIMIT 5`,
        [userId]
      );

      for (const ass of assignments) {
        const { rows: subCount } = await query(
          `SELECT COUNT(*)::int as count FROM assignment_submissions WHERE assignment_id = $1`,
          [ass.id]
        );
        const submitted = subCount[0].count;
        const pending = Math.max(0, stats.students - submitted);

        stats.homeworkStats.categories.push(ass.title.slice(0, 10));
        stats.homeworkStats.series[0].data.push(submitted);
        stats.homeworkStats.series[1].data.push(pending);
      }
    }

    // 5. Attendance Trend (Last 7 days)
    if (studentIds.length > 0) {
      const trendData = [];
      const trendDays = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        trendDays.push(dayName);

        const { rows: attStats } = await query(
          `SELECT
             COUNT(*) FILTER (WHERE status = 'present') AS present,
             COUNT(*) AS total
           FROM attendance_records
           WHERE student_id = ANY($1) AND date = $2`,
          [studentIds, dateStr]
        );

        const present = Number(attStats[0].present);
        const total = Number(attStats[0].total);
        const percent = total > 0 ? Math.round((present / total) * 100) : 0;
        trendData.push(percent);
      }
      stats.attendanceTrend.categories = trendDays;
      stats.attendanceTrend.series[0].data = trendData;
    }

  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
  }

  return stats;
};
