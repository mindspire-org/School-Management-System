import { query } from '../config/db.js';

export const getOverview = async (campusId) => {
  const whereSql = campusId ? `AND campus_id = ${Number(campusId)}` : '';
  const [studentsRes, teachersRes, busesRes, studentAttRes, teacherAttRes, alertsRes] = await Promise.all([
    query(`SELECT COUNT(*)::int AS count FROM students WHERE status = 'active' ${whereSql}`),
    query(`SELECT COUNT(*)::int AS count FROM teachers WHERE status = 'active' ${whereSql}`),
    query(`SELECT COUNT(*)::int AS count FROM buses WHERE status = 'active' ${whereSql}`),
    // Student Attendance Breakdown
    query(
      `SELECT status, COUNT(*)::int AS count
       FROM attendance_records
       WHERE date = CURRENT_DATE ${whereSql}
       GROUP BY status`
    ),
    // Teacher Attendance Breakdown
    query(
      `SELECT
         CASE
           WHEN ta.status = 'absent' AND LOWER(COALESCE(ta.remarks, '')) = 'leave' THEN 'leave'
           ELSE ta.status
         END AS status,
         COUNT(*)::int AS count
       FROM teacher_attendance ta
       JOIN teachers t ON t.id = ta.teacher_id
       WHERE ta.attendance_date = CURRENT_DATE ${whereSql.replace('campus_id', 't.campus_id')}
       GROUP BY 1`
    ),
    query(
      `SELECT id, message, severity, created_at
       FROM alerts
       WHERE 1=1 ${whereSql}
       ORDER BY created_at DESC
       LIMIT 5`
    ),
  ]);

  const totalStudents = studentsRes.rows[0]?.count || 0;
  const totalTeachers = teachersRes.rows[0]?.count || 0;
  const activeBuses = busesRes.rows[0]?.count || 0;

  // Process Student Attendance
  const sMap = Object.fromEntries(studentAttRes.rows.map(r => [r.status, r.count]));
  const studentStats = {
    total: totalStudents,
    present: sMap.present || 0,
    absent: sMap.absent || 0,
    late: sMap.late || 0,
    leave: sMap.leave || 0, // Assuming 'leave' status exists
    marked: (sMap.present || 0) + (sMap.absent || 0) + (sMap.late || 0) + (sMap.leave || 0)
  };

  // Process Teacher Attendance
  const tMap = Object.fromEntries(teacherAttRes.rows.map(r => [r.status, r.count]));
  const teacherStats = {
    total: totalTeachers,
    present: tMap.present || 0,
    absent: tMap.absent || 0,
    late: tMap.late || 0,
    leave: tMap.leave || 0,
    marked: (tMap.present || 0) + (tMap.absent || 0) + (tMap.late || 0) + (tMap.leave || 0)
  };

  return {
    totalStudents,
    totalTeachers,
    activeBuses,
    studentStats,
    teacherStats,
    recentAlerts: alertsRes.rows,
  };
};

export const getAttendanceWeekly = async (campusId, range = '7d') => {
  const whereSql = campusId ? `AND ar.campus_id = ${Number(campusId)}` : '';

  let interval = "'6 days'";
  let step = "'1 day'";
  let dateFormat = "'YYYY-MM-DD'";
  let dateTrunc = 'day';

  if (range === '1m') {
    interval = "'30 days'";
    step = "'1 day'";
  } else if (range === '1y') {
    interval = "'11 months'";
    step = "'1 month'";
    dateFormat = "'YYYY-MM'";
    dateTrunc = 'month';
  }

  const { rows } = await query(
    `SELECT
       to_char(d.day, ${dateFormat}) AS day,
       COALESCE(SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END), 0)::int AS present,
       COALESCE(SUM(CASE WHEN ar.status IN ('present','absent','late') THEN 1 ELSE 0 END), 0)::int AS total
     FROM (
       SELECT generate_series(date_trunc('${dateTrunc}', CURRENT_DATE) - INTERVAL ${interval}, date_trunc('${dateTrunc}', CURRENT_DATE), ${step})::date AS day
     ) d
     LEFT JOIN attendance_records ar ON date_trunc('${dateTrunc}', ar.date) = d.day ${whereSql}
     GROUP BY d.day
     ORDER BY d.day ASC`
  );
  return rows.map((r) => ({ day: r.day, present: Number(r.present) || 0, total: Number(r.total) || 0 }));
};

export const getFeesMonthly = async (campusId, range = '1y') => {
  const whereSql = campusId ? `AND fi.campus_id = ${Number(campusId)}` : '';

  let interval = "'5 months'"; // Default (though function name implies monthly, usually context is yearly trend)
  let step = "'1 month'";
  let dateFormat = "'YYYY-MM-DD'"; // Or YYYY-MM
  let dateTrunc = 'month';

  // Range logic for fees
  if (range === '7d') {
    interval = "'6 days'";
    step = "'1 day'";
    dateFormat = "'YYYY-MM-DD'";
    dateTrunc = 'day';
  } else if (range === '1m') {
    interval = "'30 days'";
    step = "'1 day'";
    dateFormat = "'YYYY-MM-DD'";
    dateTrunc = 'day';
  } else if (range === '1y') {
    interval = "'11 months'";
    step = "'1 month'";
    dateTrunc = 'month';
  }

  const { rows } = await query(
    `SELECT
       to_char(m.month, ${dateFormat}) AS month,
       COALESCE(SUM(CASE WHEN fi.status = 'paid' THEN fi.total ELSE 0 END), 0) AS collected,
       COALESCE(SUM(CASE WHEN fi.status != 'paid' THEN fi.balance ELSE 0 END), 0) AS pending
     FROM (
       SELECT generate_series(date_trunc('${dateTrunc}', CURRENT_DATE) - INTERVAL ${interval}, date_trunc('${dateTrunc}', CURRENT_DATE), ${step})::date AS month
     ) m
     LEFT JOIN finance_invoices fi ON date_trunc('${dateTrunc}', fi.issued_at) = m.month 
       AND fi.user_type = 'student' 
       AND fi.invoice_type = 'fee'
       ${whereSql}
     GROUP BY m.month
     ORDER BY m.month ASC`
  );
  return rows.map((r) => ({ month: r.month, collected: Number(r.collected) || 0, pending: Number(r.pending) || 0 }));
};

export default { getOverview, getAttendanceWeekly, getFeesMonthly };
