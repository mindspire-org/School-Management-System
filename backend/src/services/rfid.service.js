import { query } from '../config/db.js';

export const list = async ({ q, status, location, bus, date, startDate, endDate, campusId, page = 1, pageSize = 50 }) => {
  const params = [];
  const where = [];
  // Filters on rfid_logs
  if (status) { params.push(status.toLowerCase()); where.push(`rl.status = $${params.length}`); }
  if (location) { params.push(`%${location.toLowerCase()}%`); where.push(`LOWER(rl.location) LIKE $${params.length}`); }
  if (bus) { params.push(bus); where.push(`rl.bus_number = $${params.length}`); }
  if (date) { params.push(date); where.push(`DATE(rl.scan_time) = $${params.length}`); }
  if (startDate) { params.push(startDate); where.push(`rl.scan_time >= $${params.length}`); }
  if (endDate) { params.push(endDate); where.push(`rl.scan_time <= $${params.length}`); }
  // Text search on student name/roll or card
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    const idx = params.length;
    params.push(`%${q.toLowerCase()}%`);
    const idx2 = params.length;
    params.push(`%${q.toLowerCase()}%`);
    const idx3 = params.length;
    where.push(`(LOWER(s.name) LIKE $${idx} OR LOWER(s.roll_number) LIKE $${idx2} OR LOWER(rl.card_number) LIKE $${idx3})`);
  }

  if (campusId) {
    params.push(campusId);
    where.push(`rl.campus_id = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  // total count
  const countRes = await query(
    `SELECT COUNT(*)::int AS count
     FROM rfid_logs rl
     LEFT JOIN students s ON s.id = rl.student_id
     ${whereSql}`,
    params
  );
  const total = countRes.rows[0]?.count || 0;
  // data
  const dataRes = await query(
    `SELECT rl.id, rl.student_id AS "studentId", s.name AS "studentName", s.roll_number AS "rollNumber",
            rl.card_number AS "cardNumber", rl.bus_number AS "busNumber", rl.status, rl.location,
            rl.scan_time AS "scanTime", rl.created_at AS "createdAt"
     FROM rfid_logs rl
     LEFT JOIN students s ON s.id = rl.student_id
     ${whereSql}
     ORDER BY rl.scan_time DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, offset]
  );
  return { rows: dataRes.rows, total, page: Number(page), pageSize: Number(pageSize) };
};

export const getById = async (id) => {
  const { rows } = await query(
    `SELECT rl.id, rl.student_id AS "studentId", s.name AS "studentName", s.roll_number AS "rollNumber",
            rl.card_number AS "cardNumber", rl.bus_number AS "busNumber", rl.status, rl.location,
            rl.scan_time AS "scanTime", rl.created_at AS "createdAt"
     FROM rfid_logs rl LEFT JOIN students s ON s.id = rl.student_id
     WHERE rl.id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const create = async ({ studentId, cardNumber, busNumber, status = 'success', location, scanTime, campusId }) => {
  const { rows } = await query(
    `INSERT INTO rfid_logs (student_id, card_number, bus_number, status, location, scan_time, campus_id)
     VALUES ($1,$2,$3,LOWER($4),$5,COALESCE($6, NOW()), $7)
     RETURNING id, student_id AS "studentId", card_number AS "cardNumber", bus_number AS "busNumber", status, location, scan_time AS "scanTime", created_at AS "createdAt", campus_id AS "campusId"`,
    [studentId || null, cardNumber || null, busNumber || null, status || 'success', location || null, scanTime || null, campusId]
  );
  return rows[0];
};

export const update = async (id, { status, location, busNumber, cardNumber, scanTime }) => {
  const fields = [];
  const values = [];
  if (status !== undefined) { values.push(status.toLowerCase()); fields.push(`status = $${values.length}`); }
  if (location !== undefined) { values.push(location); fields.push(`location = $${values.length}`); }
  if (busNumber !== undefined) { values.push(busNumber); fields.push(`bus_number = $${values.length}`); }
  if (cardNumber !== undefined) { values.push(cardNumber); fields.push(`card_number = $${values.length}`); }
  if (scanTime !== undefined) { values.push(scanTime); fields.push(`scan_time = $${values.length}`); }
  if (!fields.length) return await getById(id);
  values.push(id);
  const { rowCount } = await query(`UPDATE rfid_logs SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
  if (!rowCount) return null;
  return await getById(id);
};

export const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM rfid_logs WHERE id = $1', [id]);
  return rowCount > 0;
};
