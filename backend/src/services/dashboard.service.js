import { query } from '../config/db.js';

export const getOverview = async (campusId) => {
  const whereSql = campusId ? `AND campus_id = ${Number(campusId)}` : '';
  const [studentsRes, teachersRes, busesRes, attendanceRes, alertsRes] = await Promise.all([
    query(`SELECT COUNT(*)::int AS count FROM students WHERE status = 'active' ${whereSql}`),
    query(`SELECT COUNT(*)::int AS count FROM teachers WHERE status = 'active' ${whereSql}`),
    query(`SELECT COUNT(*)::int AS count FROM buses WHERE status = 'active' ${whereSql}`),
    query(
      `SELECT status, COUNT(*)::int AS count
       FROM attendance_records
       WHERE date = CURRENT_DATE ${whereSql}
       GROUP BY status`
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

  // Compute today's attendance percentage based on records available for today
  const attMap = Object.fromEntries(attendanceRes.rows.map(r => [r.status, r.count]));
  const present = attMap.present || 0;
  const absent = attMap.absent || 0;
  const late = attMap.late || 0;
  const totalMarked = present + absent + late;
  const todayAttendance = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;

  return {
    totalStudents,
    totalTeachers,
    activeBuses,
    todayAttendance,
    recentAlerts: alertsRes.rows,
  };
};

export const getAttendanceWeekly = async (campusId) => {
  const whereSql = campusId ? `AND campus_id = ${Number(campusId)}` : '';
  const { rows } = await query(
    `SELECT
       DATE(date) AS day,
       SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END)::int AS present,
       SUM(CASE WHEN status IN ('present','absent','late') THEN 1 ELSE 0 END)::int AS total
     FROM attendance_records
     WHERE date >= CURRENT_DATE - INTERVAL '6 days' ${whereSql}
     GROUP BY day
     ORDER BY day ASC`
  );
  return rows.map((r) => ({ day: r.day, present: Number(r.present) || 0, total: Number(r.total) || 0 }));
};

export const getFeesMonthly = async (campusId) => {
  const whereSql = campusId ? `AND campus_id = ${Number(campusId)}` : '';
  const { rows } = await query(
    `SELECT
       date_trunc('month', issued_at)::date AS month,
       SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) AS collected,
       SUM(CASE WHEN status != 'paid' THEN balance ELSE 0 END) AS pending
     FROM finance_invoices
     WHERE user_type = 'student' AND invoice_type = 'fee' ${whereSql}
       AND issued_at >= (date_trunc('month', CURRENT_DATE) - INTERVAL '5 months')
     GROUP BY month
     ORDER BY month ASC`
  );
  return rows.map((r) => ({ month: r.month, collected: Number(r.collected) || 0, pending: Number(r.pending) || 0 }));
};

export default { getOverview, getAttendanceWeekly, getFeesMonthly };
