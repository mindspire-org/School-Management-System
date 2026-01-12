import { query } from '../config/db.js';

// Announcements
export const listAnnouncements = async ({ audience, campusId }) => {
  const params = [];
  const where = [];
  if (audience) { params.push(audience); where.push(`audience = $${params.length}`); }
  if (campusId) { params.push(campusId); where.push(`campus_id = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT id, title, message, audience, created_by AS "createdBy", created_at AS "createdAt", campus_id AS "campusId" FROM announcements ${whereSql} ORDER BY created_at DESC`,
    params
  );
  return rows;
};

export const getAnnouncementById = async (id) => {
  const { rows } = await query(
    'SELECT id, title, message, audience, created_by AS "createdBy", created_at AS "createdAt", campus_id AS "campusId" FROM announcements WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const createAnnouncement = async ({ title, message, audience, createdBy, campusId }) => {
  const { rows } = await query(
    'INSERT INTO announcements (title, message, audience, created_by, campus_id) VALUES ($1,$2,COALESCE($3,\'all\'),$4,$5) RETURNING id, title, message, audience, created_by AS "createdBy", created_at AS "createdAt", campus_id AS "campusId"',
    [title, message, audience || null, createdBy || null, campusId || null]
  );
  return rows[0];
};

export const updateAnnouncement = async (id, { title, message, audience }) => {
  const { rows } = await query(
    'UPDATE announcements SET title = COALESCE($2,title), message = COALESCE($3,message), audience = COALESCE($4,audience) WHERE id = $1 RETURNING id, title, message, audience, created_by AS "createdBy", created_at AS "createdAt"',
    [id, title || null, message || null, audience || null]
  );
  return rows[0] || null;
};

export const deleteAnnouncement = async (id) => {
  await query('DELETE FROM announcements WHERE id = $1', [id]);
  return true;
};

// Alerts
export const listAlerts = async (campusId) => {
  const { rows } = await query(
    `SELECT id, message, severity, created_by AS "createdBy", created_at AS "createdAt", campus_id AS "campusId" FROM alerts WHERE ($1::int IS NULL OR campus_id = $1::int) ORDER BY created_at DESC`,
    [campusId || null]
  );
  return rows;
};

export const getAlertById = async (id) => {
  const { rows } = await query(
    'SELECT id, message, severity, created_by AS "createdBy", created_at AS "createdAt", campus_id AS "campusId" FROM alerts WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const createAlert = async ({ message, severity, createdBy, campusId }) => {
  const { rows } = await query(
    'INSERT INTO alerts (message, severity, created_by, campus_id) VALUES ($1,COALESCE($2,\'info\'),$3,$4) RETURNING id, message, severity, created_by AS "createdBy", created_at AS "createdAt", campus_id AS "campusId"',
    [message, severity || null, createdBy || null, campusId || null]
  );
  return rows[0];
};

export const updateAlert = async (id, { message, severity }) => {
  const { rows } = await query(
    'UPDATE alerts SET message = COALESCE($2,message), severity = COALESCE($3,severity) WHERE id = $1 RETURNING id, message, severity, created_by AS "createdBy", created_at AS "createdAt"',
    [id, message || null, severity || null]
  );
  return rows[0] || null;
};

export const deleteAlert = async (id) => {
  await query('DELETE FROM alerts WHERE id = $1', [id]);
  return true;
};
