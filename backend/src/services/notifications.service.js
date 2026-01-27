import { query } from '../config/db.js';

export const list = async ({ userId, isRead, type, page = 1, pageSize = 50, campusId }) => {
  const params = [];
  const where = [];
  if (userId) { params.push(userId); where.push(`user_id = $${params.length}`); }
  if (type) { params.push(type); where.push(`type = $${params.length}`); }
  if (typeof isRead !== 'undefined') { params.push(isRead); where.push(`is_read = $${params.length}`); }
  if (campusId) { params.push(campusId); where.push(`campus_id = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);
  const { rows } = await query(
    `SELECT id, user_id AS "userId", type, message, is_read AS "isRead", created_at AS "createdAt", campus_id AS "campusId"
     FROM notifications ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
};

export const getById = async (id) => {
  const { rows } = await query(
    'SELECT id, user_id AS "userId", type, message, is_read AS "isRead", created_at AS "createdAt", campus_id AS "campusId" FROM notifications WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const create = async ({ userId, type, message, campusId }) => {
  const { rows } = await query(
    'INSERT INTO notifications (user_id, type, message, campus_id) VALUES ($1,$2,$3,$4) RETURNING id, user_id AS "userId", type, message, is_read AS "isRead", created_at AS "createdAt", campus_id AS "campusId"',
    [userId || null, type || null, message, campusId || null]
  );
  return rows[0];
};

export const markRead = async (id) => {
  const { rows } = await query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING id, user_id AS "userId", type, message, is_read AS "isRead", created_at AS "createdAt", campus_id AS "campusId"',
    [id]
  );
  return rows[0] || null;
};

export const remove = async (id) => {
  await query('DELETE FROM notifications WHERE id = $1', [id]);
  return true;
};
