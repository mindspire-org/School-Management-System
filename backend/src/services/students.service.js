import { query } from '../config/db.js';

export const list = async ({ page = 1, pageSize = 50, q, class: cls, section, familyNumber, campusId, allowedClassSections }) => {
  const offset = (page - 1) * pageSize;
  const where = [];
  const params = [];
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(roll_number) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(rfid_tag) LIKE $${params.length})`);
  }
  if (cls) {
    params.push(cls);
    where.push(`class = $${params.length}`);
  }
  if (section) {
    params.push(section);
    where.push(`section = $${params.length}`);
  }
  if (familyNumber) {
    params.push(familyNumber);
    where.push(`family_number = $${params.length}`);
  }
  if (campusId) {
    params.push(campusId);
    where.push(`s.campus_id = $${params.length}`);
  }

  if (Array.isArray(allowedClassSections)) {
    if (allowedClassSections.length === 0) {
      return { rows: [], total: 0, page, pageSize };
    }
    const parts = [];
    for (const scope of allowedClassSections) {
      const cn = scope?.className;
      const sec = scope?.section;
      if (!cn) continue;
      params.push(cn);
      const classIdx = params.length;
      if (sec) {
        params.push(sec);
        const secIdx = params.length;
        parts.push(`(s.class = $${classIdx} AND s.section = $${secIdx})`);
      } else {
        parts.push(`(s.class = $${classIdx})`);
      }
    }
    if (parts.length) {
      where.push(`(${parts.join(' OR ')})`);
    }
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*)::int AS count FROM students s ${whereSql.replace(/s\.campus_id/g, 'campus_id')}`; // Adjust alias for count query
  const { rows: countRows } = await query(countSql, params);
  const total = countRows[0]?.count || 0;

  const dataSql = `WITH inv AS (
                     SELECT fi.student_id,
                            BOOL_OR(fi.status = 'overdue')    AS has_overdue,
                            BOOL_OR(fi.status = 'in_progress') AS has_in_progress,
                            BOOL_OR(fi.status = 'pending')     AS has_pending,
                            BOOL_OR(fi.status = 'paid')        AS has_paid
                     FROM fee_invoices fi
                     GROUP BY fi.student_id
                   )
                   SELECT s.id, s.name, s.email, s.roll_number AS "rollNumber", s.class, s.section, s.rfid_tag AS "rfidTag", s.attendance,
                          s.family_number AS "familyNumber",
                          COALESCE(
                            CASE
                              WHEN inv.has_overdue THEN 'overdue'
                              WHEN inv.has_in_progress THEN 'in_progress'
                              WHEN inv.has_pending THEN 'pending'
                              WHEN inv.has_paid    THEN 'paid'
                              ELSE s.fee_status
                            END,
                            s.fee_status
                          ) AS "feeStatus",
                          s.bus_number AS "busNumber", s.bus_assigned AS "busAssigned", s.parent_name AS "parentName", s.parent_phone AS "parentPhone", s.status, s.admission_date AS "admissionDate", s.avatar,
                          s.avatar AS "photo", s.avatar AS "photoUrl",
                          s.personal, s.academic, s.parent, s.transport, s.fee,
                          s.campus_id AS "campusId"
                   FROM students s
                   LEFT JOIN inv ON inv.student_id = s.id
                   ${whereSql}
                   ORDER BY s.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const { rows } = await query(dataSql, [...params, pageSize, offset]);
  return { rows, total, page, pageSize };
};

export const getById = async (id) => {
  const { rows } = await query(
    'SELECT id, name, email, roll_number AS "rollNumber", class, section, rfid_tag AS "rfidTag", attendance, fee_status AS "feeStatus", bus_number AS "busNumber", bus_assigned AS "busAssigned", parent_name AS "parentName", parent_phone AS "parentPhone", status, admission_date AS "admissionDate", avatar, avatar AS "photo", avatar AS "photoUrl", family_number AS "familyNumber", personal, academic, parent, transport, fee, campus_id AS "campusId" FROM students WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const getByUserId = async (userId) => {
  const { rows } = await query(
    'SELECT id, name, email, roll_number AS "rollNumber", class, section, rfid_tag AS "rfidTag", attendance, fee_status AS "feeStatus", bus_number AS "busNumber", bus_assigned AS "busAssigned", parent_name AS "parentName", parent_phone AS "parentPhone", status, admission_date AS "admissionDate", avatar, avatar AS "photo", avatar AS "photoUrl", family_number AS "familyNumber", personal, academic, parent, transport, fee, campus_id AS "campusId" FROM students WHERE user_id = $1',
    [userId]
  );
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    name, email, rollNumber, class: cls, section, rfidTag, attendance, feeStatus,
    busNumber, busAssigned, parentName, parentPhone, status = 'active', admissionDate, avatar,
    personal, academic, parent, transport, fee, familyNumber, userId, campusId
  } = data;
  const { rows } = await query(
    `INSERT INTO students (name, email, roll_number, class, section, rfid_tag, attendance, fee_status, bus_number, bus_assigned, parent_name, parent_phone, status, admission_date, avatar, personal, academic, parent, transport, fee, family_number, user_id, campus_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
     RETURNING id, name, email, roll_number AS "rollNumber", class, section, rfid_tag AS "rfidTag", attendance, fee_status AS "feeStatus", bus_number AS "busNumber", bus_assigned AS "busAssigned", parent_name AS "parentName", parent_phone AS "parentPhone", status, admission_date AS "admissionDate", avatar, family_number AS "familyNumber", personal, academic, parent, transport, fee, campus_id AS "campusId"`,
    [
      name,
      email || null,
      rollNumber || null,
      cls || null,
      section || null,
      rfidTag || null,
      attendance || 0,
      feeStatus || 'paid',
      busNumber || null,
      busAssigned ?? false,
      parentName || null,
      parentPhone || null,
      status,
      admissionDate || new Date(),
      avatar || null,
      personal ? JSON.stringify(personal) : '{}',
      academic ? JSON.stringify(academic) : '{}',
      parent ? JSON.stringify(parent) : '{}',
      transport ? JSON.stringify(transport) : '{}',
      fee ? JSON.stringify(fee) : '{}',
      familyNumber || null,
      userId || null,
      campusId || null,
    ]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const fields = [];
  const values = [];
  const map = {
    name: 'name', email: 'email', rollNumber: 'roll_number', class: 'class', section: 'section', rfidTag: 'rfid_tag', attendance: 'attendance', feeStatus: 'fee_status', busNumber: 'bus_number', busAssigned: 'bus_assigned', parentName: 'parent_name', parentPhone: 'parent_phone', status: 'status', admissionDate: 'admission_date', avatar: 'avatar',
    personal: 'personal', academic: 'academic', parent: 'parent', transport: 'transport', fee: 'fee', familyNumber: 'family_number', userId: 'user_id', campusId: 'campus_id'
  };
  Object.entries(data || {}).forEach(([k, v]) => {
    if (map[k] !== undefined) {
      // Stringify JSONB fields
      if (['personal', 'academic', 'parent', 'transport', 'fee'].includes(k) && v !== undefined) {
        values.push(v ? JSON.stringify(v) : null);
      } else {
        values.push(v);
      }
      fields.push(`${map[k]} = $${values.length}`);
    }
  });
  if (!fields.length) return await getById(id);
  values.push(id);
  const { rowCount } = await query(`UPDATE students SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
  if (!rowCount) return null;
  return await getById(id);
};

export const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM students WHERE id = $1', [id]);
  return rowCount > 0;
};

export const listAttendance = async (studentId, { startDate, endDate, page = 1, pageSize = 50 }) => {
  const offset = (page - 1) * pageSize;
  const where = ['student_id = $1'];
  const params = [studentId];
  if (startDate) { params.push(startDate); where.push(`date >= $${params.length}`); }
  if (endDate) { params.push(endDate); where.push(`date <= $${params.length}`); }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const countRes = await query(`SELECT COUNT(*)::int AS count FROM attendance_records ${whereSql}`, params);
  const total = countRes.rows[0]?.count || 0;
  const dataRes = await query(
    `SELECT id, student_id AS "studentId", date, status, remarks, created_at AS "createdAt" 
     FROM attendance_records ${whereSql} 
     ORDER BY date DESC, id DESC 
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, offset]
  );
  return { rows: dataRes.rows, total, page, pageSize };
};

export const addAttendance = async (studentId, { date, status, remarks }) => {
  const { rows } = await query(
    `INSERT INTO attendance_records (student_id, date, status, remarks)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (student_id, date) DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks
     RETURNING id, student_id AS "studentId", date, status, remarks, created_at AS "createdAt"`,
    [studentId, date, status, remarks || null]
  );
  return rows[0];
};

export const updateAttendance = async (id, { status, remarks }) => {
  const { rowCount } = await query('UPDATE attendance_records SET status = COALESCE($1,status), remarks = COALESCE($2,remarks) WHERE id = $3', [status || null, remarks || null, id]);
  if (!rowCount) return null;
  const { rows } = await query('SELECT id, student_id AS "studentId", date, status, remarks, created_at AS "createdAt" FROM attendance_records WHERE id = $1', [id]);
  return rows[0] || null;
};

export const removeAttendance = async (id) => {
  const { rowCount } = await query('DELETE FROM attendance_records WHERE id = $1', [id]);
  return rowCount > 0;
};

export const getPerformance = async (studentId) => {
  const [avgRes, subjRes, recentRes, totalExamsRes] = await Promise.all([
    query('SELECT COALESCE(AVG(marks),0)::float AS avg FROM exam_results WHERE student_id = $1', [studentId]),
    query('SELECT subject, COALESCE(AVG(marks),0)::float AS avg, COUNT(*)::int AS count FROM exam_results WHERE student_id = $1 GROUP BY subject ORDER BY subject', [studentId]),
    query(`SELECT er.id, er.exam_id AS "examId", er.subject, er.marks, er.grade, e.title, e.exam_date AS "examDate"
           FROM exam_results er LEFT JOIN exams e ON e.id = er.exam_id
           WHERE er.student_id = $1
           ORDER BY e.exam_date DESC NULLS LAST, er.id DESC
           LIMIT 10`, [studentId]),
    query('SELECT COUNT(DISTINCT exam_id)::int AS total FROM exam_results WHERE student_id = $1', [studentId]),
  ]);
  return {
    average: avgRes.rows[0]?.avg || 0,
    totalExams: totalExamsRes.rows[0]?.total || 0,
    subjects: subjRes.rows,
    recentResults: recentRes.rows,
  };
};

export const getFees = async (studentId) => {
  const { rows: invoices } = await query(
    `SELECT fi.id, fi.amount::float, fi.status, fi.due_date AS "dueDate", fi.issued_at AS "issuedAt",
            COALESCE(SUM(fp.amount),0)::float AS paid
     FROM fee_invoices fi
     LEFT JOIN fee_payments fp ON fi.id = fp.invoice_id
     WHERE fi.student_id = $1
     GROUP BY fi.id
     ORDER BY fi.issued_at DESC`,
    [studentId]
  );
  let totalInvoiced = 0, totalPaid = 0, totalOutstanding = 0, overdueOutstanding = 0, overdueCount = 0;
  invoices.forEach(inv => {
    totalInvoiced += inv.amount;
    totalPaid += inv.paid;
    const outstanding = Math.max(inv.amount - inv.paid, 0);
    totalOutstanding += outstanding;
    inv.outstanding = outstanding;
    const isOverdue = inv.dueDate && inv.status !== 'paid' && new Date(inv.dueDate) < new Date();
    if (isOverdue) { overdueOutstanding += outstanding; overdueCount += 1; }
  });
  return { invoices, totals: { totalInvoiced, totalPaid, totalOutstanding, overdueOutstanding, overdueCount } };
};

// Keep students.fee_status in sync with invoices for visibility in DB tools
const recomputeFeeStatus = async (studentId) => {
  await query(
    `WITH agg AS (
       SELECT
         BOOL_OR(status = 'overdue')    AS has_overdue,
         BOOL_OR(status = 'in_progress') AS has_in_progress,
         BOOL_OR(status = 'pending')     AS has_pending,
         BOOL_OR(status = 'paid')        AS has_paid
       FROM fee_invoices WHERE student_id = $1
     )
     UPDATE students s
     SET fee_status = COALESCE(
       (SELECT CASE
          WHEN has_overdue THEN 'overdue'
          WHEN has_in_progress THEN 'in_progress'
          WHEN has_pending THEN 'pending'
          WHEN has_paid THEN 'paid'
          ELSE s.fee_status
        END FROM agg),
       s.fee_status
     )
     WHERE s.id = $1`,
    [studentId]
  );
};

export const recordPayment = async (studentId, { invoiceId, amount, method }) => {
  const { rows: invRows } = await query('SELECT id FROM fee_invoices WHERE id = $1 AND student_id = $2', [invoiceId, studentId]);
  if (!invRows[0]) return null;
  const { rows } = await query(
    'INSERT INTO fee_payments (invoice_id, amount, method) VALUES ($1,$2,$3) RETURNING id, invoice_id AS "invoiceId", amount::float, method, paid_at AS "paidAt"',
    [invoiceId, amount, method || null]
  );
  try {
    const { rows: sums } = await query(
      `SELECT fi.amount::float AS amount, COALESCE(SUM(fp.amount),0)::float AS paid
         FROM fee_invoices fi
         LEFT JOIN fee_payments fp ON fp.invoice_id = fi.id
        WHERE fi.id = $1
        GROUP BY fi.id`,
      [invoiceId]
    );
    const inv = sums[0];
    if (inv && Number(inv.paid) >= Number(inv.amount)) {
      await query('UPDATE fee_invoices SET status = $2 WHERE id = $1', [invoiceId, 'paid']);
    }
  } catch (_) {}

  await recomputeFeeStatus(studentId);
  return rows[0];
};

export const listFeePayments = async (studentId) => {
  const { rows } = await query(
    `SELECT fp.id,
            fp.invoice_id AS "invoiceId",
            fp.amount::float,
            fp.method,
            fp.paid_at AS "paidAt",
            fi.status AS "invoiceStatus",
            fi.due_date AS "dueDate",
            fi.issued_at AS "issuedAt"
       FROM fee_payments fp
       JOIN fee_invoices fi ON fi.id = fp.invoice_id
      WHERE fi.student_id = $1
      ORDER BY fp.paid_at DESC, fp.id DESC`,
    [studentId]
  );
  return rows;
};

export const createInvoice = async (studentId, { amount, dueDate, status }) => {
  const { rows } = await query(
    `INSERT INTO fee_invoices (student_id, amount, status, due_date)
     VALUES ($1,$2,COALESCE($3,'pending'),$4)
     RETURNING id, student_id AS "studentId", amount::float, status, due_date AS "dueDate", issued_at AS "issuedAt"`,
    [studentId, amount, status || null, dueDate || null]
  );
  await recomputeFeeStatus(studentId);
  return rows[0];
};

export const updateInvoice = async (studentId, invoiceId, { amount, dueDate, status }) => {
  const { rows } = await query(
    `UPDATE fee_invoices
     SET amount = COALESCE($3, amount),
         due_date = COALESCE($4, due_date),
         status = COALESCE($5, status)
     WHERE id = $1 AND student_id = $2
     RETURNING id, student_id AS "studentId", amount::float, status, due_date AS "dueDate", issued_at AS "issuedAt"`,
    [invoiceId, studentId, amount ?? null, dueDate ?? null, status ?? null]
  );
  await recomputeFeeStatus(studentId);
  return rows[0] || null;
};

export const getTransport = async (studentId) => {
  const { rows } = await query(
    `SELECT st.id, st.student_id AS "studentId", st.route_id AS "routeId", r.name AS "routeName",
            st.bus_id AS "busId", b.number AS "busNumber",
            st.pickup_stop_id AS "pickupStopId", ps.name AS "pickupStopName",
            st.drop_stop_id AS "dropStopId", ds.name AS "dropStopName"
     FROM student_transport st
     LEFT JOIN routes r ON r.id = st.route_id
     LEFT JOIN buses b ON b.id = st.bus_id
     LEFT JOIN route_stops ps ON ps.id = st.pickup_stop_id
     LEFT JOIN route_stops ds ON ds.id = st.drop_stop_id
     WHERE st.student_id = $1`,
    [studentId]
  );
  return rows[0] || null;
};

export const updateTransport = async (studentId, { routeId, busId, pickupStopId, dropStopId }) => {
  const { rows: existing } = await query('SELECT id FROM student_transport WHERE student_id = $1', [studentId]);
  if (existing[0]) {
    await query('UPDATE student_transport SET route_id = $1, bus_id = $2, pickup_stop_id = $3, drop_stop_id = $4 WHERE student_id = $5', [routeId || null, busId || null, pickupStopId || null, dropStopId || null, studentId]);
  } else {
    await query('INSERT INTO student_transport (student_id, route_id, bus_id, pickup_stop_id, drop_stop_id) VALUES ($1,$2,$3,$4,$5)', [studentId, routeId || null, busId || null, pickupStopId || null, dropStopId || null]);
  }
  return await getTransport(studentId);
};

export const getDashboardStats = async (studentId) => {
  const stats = {
    todaysClasses: 0,
    attendance: 0,
    pendingAssignments: 0,
    upcomingExams: 0,
    notifications: 0
  };

  try {
    // Get student details first (class, section, user_id)
    const { rows: studentRows } = await query('SELECT id, class, section, attendance, user_id FROM students WHERE id = $1', [studentId]);
    if (!studentRows.length) return stats;
    const student = studentRows[0];

    stats.attendance = Number(student.attendance || 0);

    // 1. Today's Classes
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Normalize day to 1-7
    let dayIdx = null;
    const lowerDay = today.toLowerCase();
    const idx = dayNames.findIndex(d => d.toLowerCase() === lowerDay);
    if (idx >= 0) dayIdx = idx + 1;

    if (dayIdx && student.class) {
      const { rows: classRows } = await query(
        `SELECT COUNT(*)::int as count FROM teacher_schedules 
         WHERE class = $1 AND (section IS NULL OR section = $2) AND day_of_week = $3`,
        [student.class, student.section, dayIdx]
      );
      stats.todaysClasses = classRows[0]?.count || 0;
    }

    // 2. Pending Assignments
    if (student.class) {
      const { rows: assignRows } = await query(
        `SELECT COUNT(*)::int as count 
         FROM assignments a
         WHERE a.class = $1 AND (a.section IS NULL OR a.section = $2)
           AND a.due_date >= NOW()
           AND NOT EXISTS (
             SELECT 1 FROM assignment_submissions s 
             WHERE s.assignment_id = a.id AND s.student_id = $3
           )`,
        [student.class, student.section, studentId]
      );
      stats.pendingAssignments = assignRows[0]?.count || 0;
    }

    // 3. Upcoming Exams
    if (student.class) {
      const { rows: examRows } = await query(
        `SELECT COUNT(*)::int as count FROM exams 
         WHERE class = $1 AND (section IS NULL OR section = $2) AND exam_date >= CURRENT_DATE`,
        [student.class, student.section]
      );
      stats.upcomingExams = examRows[0]?.count || 0;
    }

    // 4. Notifications
    if (student.user_id) {
      const { rows: notifRows } = await query(
        `SELECT COUNT(*)::int as count FROM notifications WHERE user_id = $1 AND is_read = false`,
        [student.user_id]
      );
      stats.notifications = notifRows[0]?.count || 0;
    }

  } catch (err) {
    console.error('Error fetching student dashboard stats:', err);
  }
  return stats;
};

export const getAttendanceTrend = async (studentId) => {
  // Returns attendance % for the last 5 weeks
  const { rows } = await query(`
    WITH weeks AS (
      SELECT 
        date_trunc('week', current_date) - (n * interval '1 week') as week_start,
        date_trunc('week', current_date) - (n * interval '1 week') + interval '6 days' as week_end,
        5 - n as week_num
      FROM generate_series(0, 4) n
    )
    SELECT 
      w.week_num,
      COUNT(ar.id) as total_days,
      COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_days
    FROM weeks w
    LEFT JOIN attendance_records ar ON ar.student_id = $1 
      AND ar.date >= w.week_start AND ar.date <= w.week_end
    GROUP BY w.week_num
    ORDER BY w.week_num ASC
  `, [studentId]);

  return rows.map(r => {
    const total = Number(r.total_days);
    const present = Number(r.present_days);
    return total > 0 ? Math.round((present / total) * 100) : 0;
  });
};

export const listSubjectTeachers = async ({ studentId, campusId }) => {
  const { rows: stRows } = await query('SELECT class, section, campus_id FROM students WHERE id = $1', [studentId]);
  const st = stRows[0];
  if (!st?.class) return [];

  const params = [JSON.stringify([st.class])];
  const where = ['tsa.classes @> $1::jsonb'];
  if (st.class && st.section) {
    params.push(JSON.stringify([`${st.class}-${st.section}`]));
    where.push(`tsa.classes @> $${params.length}::jsonb`);
  }
  if (campusId) {
    params.push(Number(campusId));
  }

  const whereSql = `WHERE (${where.join(' OR ')})`;
  const campusSql = campusId ? `AND t.campus_id = $${params.length}` : '';

  const { rows } = await query(
    `SELECT tsa.id,
            tsa.subject_id AS "subjectId",
            s.name AS "subjectName",
            tsa.teacher_id AS "teacherId",
            t.name AS "teacherName",
            t.email AS "teacherEmail",
            t.phone AS "teacherPhone",
            t.avatar AS "teacherAvatar",
            tsa.is_primary AS "isPrimary"
       FROM teacher_subject_assignments tsa
       JOIN subjects s ON s.id = tsa.subject_id
       JOIN teachers t ON t.id = tsa.teacher_id
       ${whereSql}
       ${campusSql}
       ORDER BY s.name ASC, t.name ASC`,
    params
  );
  return rows;
};
