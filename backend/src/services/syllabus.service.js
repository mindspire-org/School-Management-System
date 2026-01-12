import { query } from '../config/db.js';

const selectColumns = `
  si.id,
  si.class_name AS "className",
  si.section,
  si.subject,
  si.teacher_id AS "teacherId",
  t.name AS "teacherName",
  si.chapters,
  si.covered,
  si.due_date AS "dueDate",
  si.notes,
  si.created_at AS "createdAt",
  si.updated_at AS "updatedAt"
`;

const mapRow = (row) => ({
  id: row.id,
  className: row.className,
  section: row.section || '',
  subject: row.subject,
  teacherId: row.teacherId || null,
  teacherName: row.teacherName || null,
  chapters: Number(row.chapters) || 0,
  covered: Number(row.covered) || 0,
  dueDate: row.dueDate ? String(row.dueDate).slice(0, 10) : null,
  notes: row.notes || '',
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const list = async (filters = {}) => {
  const where = [];
  const params = [];
  if (filters.className) {
    params.push(filters.className);
    where.push(`si.class_name = $${params.length}`);
  }
  if (filters.section) {
    params.push(filters.section);
    where.push(`si.section = $${params.length}`);
  }
  if (filters.subject) {
    params.push(filters.subject);
    where.push(`si.subject = $${params.length}`);
  }
  if (filters.teacherId) {
    params.push(filters.teacherId);
    where.push(`si.teacher_id = $${params.length}`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    where.push(`(si.class_name ILIKE $${params.length} OR si.section ILIKE $${params.length} OR si.subject ILIKE $${params.length})`);
  }
  if (filters.campusId) {
    params.push(filters.campusId);
    where.push(`si.campus_id = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${selectColumns}
       FROM syllabus_items si
       LEFT JOIN teachers t ON t.id = si.teacher_id
       ${whereSql}
       ORDER BY si.class_name, si.section NULLS FIRST, si.subject`,
    params
  );
  return rows.map(mapRow);
};

export const getById = async (id) => {
  const { rows } = await query(
    `SELECT ${selectColumns}
       FROM syllabus_items si
       LEFT JOIN teachers t ON t.id = si.teacher_id
       WHERE si.id = $1`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
};

export const create = async (payload = {}) => {
  const values = [
    payload.className,
    payload.section ?? null,
    payload.subject,
    payload.teacherId ?? null,
    payload.chapters ?? 0,
    payload.covered ?? 0,
    payload.dueDate ?? null,
    payload.notes ?? null,
    payload.campusId ?? null,
  ];
  const { rows } = await query(
    `INSERT INTO syllabus_items (class_name, section, subject, teacher_id, chapters, covered, due_date, notes, campus_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    values
  );
  return await getById(rows[0].id);
};

export const update = async (id, payload = {}) => {
  const updates = [];
  const values = [];
  const mapping = {
    className: 'class_name',
    section: 'section',
    subject: 'subject',
    teacherId: 'teacher_id',
    chapters: 'chapters',
    covered: 'covered',
    dueDate: 'due_date',
    notes: 'notes',
  };
  Object.entries(mapping).forEach(([field, column]) => {
    if (field in payload) {
      values.push(payload[field] ?? null);
      updates.push(`${column} = $${values.length}`);
    }
  });
  if (!updates.length) return await getById(id);
  updates.push('updated_at = NOW()');
  values.push(id);
  const { rows } = await query(
    `UPDATE syllabus_items SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING id`,
    values
  );
  return rows[0] ? await getById(rows[0].id) : null;
};

export const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM syllabus_items WHERE id = $1', [id]);
  return rowCount > 0;
};
