import { query } from '../config/db.js';

export const list = async ({ examId, studentId, subject, className, section, q, page = 1, pageSize = 50, campusId, allowedStudentIds, allowedClassSections }) => {
  const params = [];
  const where = [];
  if (examId) { params.push(examId); where.push(`er.exam_id = $${params.length}`); }
  if (studentId) { params.push(studentId); where.push(`er.student_id = $${params.length}`); }
  if (subject) { params.push(subject); where.push(`er.subject = $${params.length}`); }
  if (className) { params.push(className); where.push(`s.class = $${params.length}`); }
  if (section) { params.push(section); where.push(`s.section = $${params.length}`); }
  if (q) { params.push(`%${q.toLowerCase()}%`); where.push(`(LOWER(s.name) LIKE $${params.length} OR LOWER(COALESCE(s.roll_number,'')) LIKE $${params.length})`); }
  if (campusId) { params.push(campusId); where.push(`er.campus_id = $${params.length}`); }

  if (Array.isArray(allowedStudentIds)) {
    if (!allowedStudentIds.length) return [];
    params.push(allowedStudentIds.map((v) => Number(v)).filter((v) => Number.isFinite(v)));
    where.push(`er.student_id = ANY($${params.length}::int[])`);
  }

  if (Array.isArray(allowedClassSections)) {
    if (allowedClassSections.length === 0) return [];
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
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);
  const { rows } = await query(
    `SELECT er.id,
            er.exam_id AS "examId",
            e.title AS "examTitle",
            er.student_id AS "studentId",
            s.name AS "studentName",
            s.class,
            s.section,
            er.subject,
            er.marks,
            er.grade
     FROM exam_results er
     LEFT JOIN students s ON s.id = er.student_id
     LEFT JOIN exams e ON e.id = er.exam_id
     ${whereSql}
     ORDER BY er.id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
};

export const getById = async (id) => {
  const { rows } = await query(
    `SELECT er.id,
            er.exam_id AS "examId",
            e.title AS "examTitle",
            er.student_id AS "studentId",
            s.name AS "studentName",
            s.class,
            s.section,
            er.subject,
            er.marks,
            er.grade,
            er.campus_id AS "campusId"
     FROM exam_results er
     LEFT JOIN students s ON s.id = er.student_id
     LEFT JOIN exams e ON e.id = er.exam_id
     WHERE er.id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const create = async ({ examId, studentId, subject, marks, grade, campusId }) => {
  const { rows } = await query(
    'INSERT INTO exam_results (exam_id, student_id, subject, marks, grade, campus_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, exam_id AS "examId", student_id AS "studentId", subject, marks, grade, campus_id AS "campusId"',
    [examId, studentId, subject, marks || null, grade || null, campusId || null]
  );
  return rows[0];
};

export const update = async (id, { subject, marks, grade }) => {
  const { rows } = await query(
    'UPDATE exam_results SET subject = COALESCE($2,subject), marks = COALESCE($3,marks), grade = COALESCE($4,grade) WHERE id = $1 RETURNING id, exam_id AS "examId", student_id AS "studentId", subject, marks, grade',
    [id, subject || null, marks || null, grade || null]
  );
  return rows[0] || null;
};

export const remove = async (id) => {
  await query('DELETE FROM exam_results WHERE id = $1', [id]);
  return true;
};

export const bulkCreate = async (items = []) => {
  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) return [];
  // Build multi-values insert
  const params = [];
  const values = rows.map((r, i) => {
    const baseIndex = i * 5;
    params.push(r.examId, r.studentId, r.subject, r.marks ?? null, r.grade ?? null);
    return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`;
  }).join(',');
  const sql = `INSERT INTO exam_results (exam_id, student_id, subject, marks, grade)
               VALUES ${values}
               RETURNING id, exam_id AS "examId", student_id AS "studentId", subject, marks, grade`;
  const res = await query(sql, params);
  return res.rows || [];
};
