import { query } from '../config/db.js';

const getOverview = async ({ campusId }) => {
  const baseParams = [];
  const where = [];
  if (campusId) {
    baseParams.push(Number(campusId));
    where.push(`campus_id = $${baseParams.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [students, teachers, assignments, invoices] = await Promise.all([
    query(`SELECT COUNT(*)::int AS count FROM students ${whereSql}`, baseParams),
    query(`SELECT COUNT(*)::int AS count FROM teachers ${whereSql}`, baseParams),
    query(`SELECT COUNT(*)::int AS count FROM assignments ${whereSql}`, baseParams),
    query(
      `SELECT
         SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)::int AS paid,
         SUM(CASE WHEN status IN ('pending','partial') THEN 1 ELSE 0 END)::int AS pending,
         SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END)::int AS overdue
       FROM finance_invoices
       WHERE user_type = 'student' AND invoice_type = 'fee'
       ${campusId ? `AND campus_id = $1` : ''}`,
      baseParams
    ),
  ]);

  return {
    students: students.rows[0].count,
    teachers: teachers.rows[0].count,
    assignments: assignments.rows[0].count,
    finance: invoices.rows[0],
  };
};

const getAttendanceHeatmap = async ({ fromDate, toDate, klass, section, location, campusId }) => {
  // Determine denominator: total students in scope
  const scopeParams = [];
  const scopeWhere = [];
  if (klass) { scopeParams.push(klass); scopeWhere.push(`class = $${scopeParams.length}`); }
  if (section) { scopeParams.push(section); scopeWhere.push(`section = $${scopeParams.length}`); }
  if (campusId) { scopeParams.push(campusId); scopeWhere.push(`campus_id = $${scopeParams.length}`); }
  const scopeSql = scopeWhere.length ? `WHERE ${scopeWhere.join(' AND ')}` : '';
  const totalStudentsRes = await query(`SELECT COUNT(*)::int AS c FROM students ${scopeSql}`, scopeParams);
  const denom = Number(totalStudentsRes.rows?.[0]?.c || 0) || 0;

  // Aggregate RFID logs into weekday (1-6) and 8 periods across 08:00-16:00
  const params = [];
  const where = ["rl.student_id IS NOT NULL"]; // only mapped scans
  if (fromDate) { params.push(fromDate); where.push(`rl.scan_time::date >= $${params.length}`); }
  if (toDate) { params.push(toDate); where.push(`rl.scan_time::date <= $${params.length}`); }
  if (section) { params.push(section); where.push(`s.section = $${params.length}`); }
  if (location) { params.push(location); where.push(`rl.location = $${params.length}`); }
  if (campusId) { params.push(campusId); where.push(`rl.campus_id = $${params.length}`); }
  // Only Mon..Sat (1..6)
  where.push(`EXTRACT(DOW FROM rl.scan_time) BETWEEN 1 AND 6`);
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT 
        (EXTRACT(DOW FROM rl.scan_time))::int AS dow,
        LEAST(GREATEST(FLOOR(EXTRACT(HOUR FROM rl.scan_time)) - 8, 0), 7)::int AS period,
        COUNT(DISTINCT rl.student_id)::int AS count
     FROM rfid_logs rl
     LEFT JOIN students s ON s.id = rl.student_id
     ${whereSql}
     GROUP BY dow, period
     ORDER BY dow, period`,
    params
  );
  const items = rows.map(r => ({
    dow: Number(r.dow),
    period: Number(r.period),
    count: Number(r.count),
    pct: denom ? Math.round((Number(r.count) * 100) / denom) : 0,
  }));
  return { denom, items };
};

const getAttendanceByClass = async ({ fromDate, toDate, klass, section, roll, campusId }) => {
  const params = [];
  const where = ['ar.student_id IS NOT NULL'];
  if (fromDate) { params.push(fromDate); where.push(`ar.date >= $${params.length}`); }
  if (toDate) { params.push(toDate); where.push(`ar.date <= $${params.length}`); }
  if (klass) { params.push(klass); where.push(`s.class = $${params.length}`); }
  if (section) { params.push(section); where.push(`s.section = $${params.length}`); }
  if (roll) { params.push(roll); where.push(`LOWER(s.roll_number) = LOWER($${params.length})`); }
  if (campusId) { params.push(campusId); where.push(`ar.campus_id = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT s.class, s.section,
            COUNT(*)::int AS total,
            SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END)::int AS present,
            SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END)::int AS absent,
            SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END)::int AS late
     FROM attendance_records ar
     LEFT JOIN students s ON s.id = ar.student_id
     ${whereSql}
     GROUP BY s.class, s.section
     ORDER BY s.class NULLS LAST, s.section NULLS LAST`,
    params
  );
  return rows;
};

const getAttendanceSummary = async ({ fromDate, toDate, klass, section, roll, campusId }) => {
  const params = [];
  const where = ['ar.student_id IS NOT NULL'];
  if (fromDate) { params.push(fromDate); where.push(`ar.date >= $${params.length}`); }
  if (toDate) { params.push(toDate); where.push(`ar.date <= $${params.length}`); }
  if (klass) { params.push(klass); where.push(`s.class = $${params.length}`); }
  if (section) { params.push(section); where.push(`s.section = $${params.length}`); }
  if (roll) { params.push(roll); where.push(`LOWER(s.roll_number) = LOWER($${params.length})`); }
  if (campusId) { params.push(campusId); where.push(`ar.campus_id = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ar.status, COUNT(*)::int AS count
     FROM attendance_records ar
     LEFT JOIN students s ON s.id = ar.student_id
     ${whereSql}
     GROUP BY ar.status`,
    params
  );
  const counts = { present: 0, absent: 0, late: 0 };
  for (const r of rows) counts[r.status] = Number(r.count);
  const total = counts.present + counts.absent + counts.late;
  const pct = total ? {
    present: +(counts.present * 100 / total).toFixed(2),
    absent: +(counts.absent * 100 / total).toFixed(2),
    late: +(counts.late * 100 / total).toFixed(2),
  } : { present: 0, absent: 0, late: 0 };
  return { counts, total, pct };
};

const getFinanceSummary = async ({ fromDate, toDate, campusId }) => {
  const invParams = [];
  const invWhere = ["user_type = 'student'", "invoice_type = 'fee'"];
  if (fromDate) { invParams.push(fromDate); invWhere.push(`issued_at::date >= $${invParams.length}`); }
  if (toDate) { invParams.push(toDate); invWhere.push(`issued_at::date <= $${invParams.length}`); }
  if (campusId) { invParams.push(Number(campusId)); invWhere.push(`campus_id = $${invParams.length}`); }
  const invWhereSql = invWhere.length ? `WHERE ${invWhere.join(' AND ')}` : '';

  const payParams = [];
  const payWhere = ["fi.user_type = 'student'", "fi.invoice_type = 'fee'"];
  if (fromDate) { payParams.push(fromDate); payWhere.push(`fp.paid_at::date >= $${payParams.length}`); }
  if (toDate) { payParams.push(toDate); payWhere.push(`fp.paid_at::date <= $${payParams.length}`); }
  if (campusId) { payParams.push(Number(campusId)); payWhere.push(`fp.campus_id = $${payParams.length}`); }
  const payWhereSql = payWhere.length ? `WHERE ${payWhere.join(' AND ')}` : '';

  const [agg, payments] = await Promise.all([
    query(
      `SELECT
         SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END)::numeric AS paidAmount,
         SUM(CASE WHEN status IN ('pending','partial') THEN balance ELSE 0 END)::numeric AS pendingAmount,
         SUM(CASE WHEN status = 'overdue' THEN balance ELSE 0 END)::numeric AS overdueAmount,
         SUM(total)::numeric AS totalAmount
       FROM finance_invoices ${invWhereSql}`,
      invParams
    ),
    query(
      `SELECT SUM(fp.amount)::numeric AS paidTotal
       FROM finance_payments fp
       JOIN finance_invoices fi ON fp.invoice_id = fi.id
       ${payWhereSql}`,
      payParams
    ),
  ]);

  const a = agg.rows[0];
  const p = payments.rows[0];
  return {
    paidAmount: a.paidamount || 0,
    pendingAmount: a.pendingamount || 0,
    overdueAmount: a.overdueamount || 0,
    totalAmount: a.totalamount || 0,
    paidTotal: p.paidtotal || 0,
  };
};

const getExamPerformance = async ({ examId, campusId }) => {
  const params = [];
  const where = [];
  if (examId) { params.push(examId); where.push(`er.exam_id = $${params.length}`); }
  if (campusId) { params.push(campusId); where.push(`er.campus_id = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT er.exam_id AS "examId", er.subject, AVG(er.marks)::numeric(5,2) AS avgMarks
     FROM exam_results er ${whereSql}
     GROUP BY er.exam_id, er.subject
     ORDER BY subject ASC`,
    params
  );
  return rows;
};

export {
  getOverview,
  getAttendanceHeatmap,
  getAttendanceByClass,
  getAttendanceSummary,
  getFinanceSummary,
  getExamPerformance,
};
