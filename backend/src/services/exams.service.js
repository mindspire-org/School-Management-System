import { query } from '../config/db.js';

export const listExams = async ({ q, className, section, status, subject, fromDate, toDate, page = 1, pageSize = 50, campusId }) => {
  const params = [];
  const where = [];
  if (q) { params.push(`%${q}%`); where.push(`(title ILIKE $${params.length} OR classes ILIKE $${params.length})`); }
  if (className) { params.push(className); where.push(`class = $${params.length}`); }
  if (section) { params.push(section); where.push(`section = $${params.length}`); }
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  if (subject) { params.push(subject); where.push(`subject = $${params.length}`); }
  // Date filtering on start_date/end_date fallback to exam_date
  if (fromDate) { params.push(fromDate); where.push(`COALESCE(start_date, exam_date) >= $${params.length}`); }
  if (toDate) { params.push(toDate); where.push(`COALESCE(end_date, exam_date) <= $${params.length}`); }
  if (campusId) { params.push(campusId); where.push(`e.campus_id = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);
  const { rows } = await query(
    `SELECT e.id, e.title, e.exam_date AS "examDate", e.class, e.section,
            e.start_date AS "startDate", e.end_date AS "endDate", e.status, e.classes,
            e.subject, e.invigilator_id AS "invigilatorId", t.name AS "invigilatorName", e.campus_id AS "campusId"
     FROM exams e
     LEFT JOIN teachers t ON t.id = e.invigilator_id
     ${whereSql}
     ORDER BY COALESCE(e.start_date, e.exam_date) DESC NULLS LAST, e.id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
};

export const getExamById = async (id) => {
  const { rows } = await query(
    `SELECT e.id, e.title, e.exam_date AS "examDate", e.class, e.section,
            e.start_date AS "startDate", e.end_date AS "endDate", e.status, e.classes,
            e.subject, e.invigilator_id AS "invigilatorId", t.name AS "invigilatorName", e.campus_id AS "campusId"
     FROM exams e
     LEFT JOIN teachers t ON t.id = e.invigilator_id
     WHERE e.id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const createExam = async ({ title, examDate, className, section, startDate, endDate, status, classes, subject, invigilatorId, campusId }) => {
  const { rows } = await query(
    `INSERT INTO exams (title, exam_date, class, section, start_date, end_date, status, classes, subject, invigilator_id, campus_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING id, title, exam_date AS "examDate", class, section, start_date AS "startDate", end_date AS "endDate", status, classes, subject, invigilator_id AS "invigilatorId", campus_id AS "campusId"`,
    [title, examDate || null, className || null, section || null, startDate || null, endDate || null, status || 'Planned', classes || null, subject || null, invigilatorId || null, campusId || null]
  );
  return rows[0];
};

export const updateExam = async (id, { title, examDate, className, section, startDate, endDate, status, classes, subject, invigilatorId }) => {
  const { rows } = await query(
    `UPDATE exams
     SET title = COALESCE($2,title),
         exam_date = COALESCE($3,exam_date),
         class = COALESCE($4,class),
         section = COALESCE($5,section),
         start_date = COALESCE($6,start_date),
         end_date = COALESCE($7,end_date),
         status = COALESCE($8,status),
         classes = COALESCE($9,classes),
         subject = COALESCE($10,subject),
         invigilator_id = COALESCE($11,invigilator_id)
     WHERE id = $1
     RETURNING id, title, exam_date AS "examDate", class, section, start_date AS "startDate", end_date AS "endDate", status, classes, subject, invigilator_id AS "invigilatorId"`,
    [id, title || null, examDate || null, className || null, section || null, startDate || null, endDate || null, status || null, classes || null, subject || null, invigilatorId || null]
  );
  return rows[0] || null;
};

export const deleteExam = async (id) => {
  await query('DELETE FROM exams WHERE id = $1', [id]);
  return true;
};
