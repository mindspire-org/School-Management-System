import { query } from '../config/db.js';
import { ensureAssignmentSubmissionSchema } from '../db/autoMigrate.js';

export const list = async ({ page = 1, pageSize = 50, q, campusId }) => {
  const offset = (page - 1) * pageSize;
  const params = [];
  const where = [];
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`);
  }
  if (campusId) { params.push(campusId); where.push(`campus_id = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS count FROM assignments ${whereSql}`, params);
  const total = countRows[0]?.count || 0;

  const { rows } = await query(
    `SELECT a.id,
            a.title,
            a.description,
            a.subject,
            a.due_date AS "dueDate",
            a.class,
            a.section,
            a.created_by AS "createdBy",
            u.name AS "createdByName",
            a.campus_id AS "campusId"
       FROM assignments a
       LEFT JOIN users u ON u.id = a.created_by
       ${whereSql.replace(/\bassignments\b/g, 'a')}
       ORDER BY a.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, offset]
  );
  return { rows, total, page, pageSize };
};

export const getById = async (id) => {
  const { rows } = await query('SELECT id, title, description, subject, due_date AS "dueDate", class, section, created_by AS "createdBy", campus_id AS "campusId" FROM assignments WHERE id = $1', [id]);
  return rows[0] || null;
};

export const create = async ({ title, description, subject, dueDate, class: cls, section, campusId }, user) => {
  const { rows } = await query(
    'INSERT INTO assignments (title, description, subject, due_date, class, section, created_by, campus_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, title, description, subject, due_date AS "dueDate", class, section, created_by AS "createdBy", campus_id AS "campusId"',
    [title, description || null, subject || null, dueDate || null, cls || null, section || null, user?.id || null, campusId || null]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const fields = [];
  const values = [];
  const map = { title: 'title', description: 'description', subject: 'subject', dueDate: 'due_date', class: 'class', section: 'section' };
  Object.entries(data || {}).forEach(([k, v]) => { if (map[k] !== undefined) { values.push(v); fields.push(`${map[k]} = $${values.length}`); } });
  if (!fields.length) return await getById(id);
  values.push(id);
  const { rowCount } = await query(`UPDATE assignments SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
  if (!rowCount) return null;
  return await getById(id);
};

export const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM assignments WHERE id = $1', [id]);
  return rowCount > 0;
};

export const submitWork = async (assignmentId, studentId, { content }) => {
  await ensureAssignmentSubmissionSchema();
  const { rows } = await query(
    `INSERT INTO assignment_submissions (assignment_id, student_id, content)
     VALUES ($1,$2,$3)
     ON CONFLICT (assignment_id, student_id)
     DO UPDATE SET content = EXCLUDED.content, submitted_at = NOW(), status = 'submitted'
     RETURNING id,
               assignment_id AS "assignmentId",
               student_id AS "studentId",
               content,
               submitted_at AS "submittedAt",
               status,
               score,
               teacher_comment AS "teacherComment",
               rubric,
               graded_at AS "gradedAt"`,
    [assignmentId, studentId, content]
  );
  return rows[0];
};

// List assignments created by or assigned to a specific teacher
export const listByTeacher = async (teacherId, { page = 1, pageSize = 50, q }) => {
  const offset = (page - 1) * pageSize;
  const params = [teacherId];
  const where = ['(a.created_by = $1 OR EXISTS (SELECT 1 FROM teachers t WHERE t.id = $1 AND (a.class = ANY(t.classes) OR a.class IS NULL)))'];

  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(LOWER(a.title) LIKE $${params.length} OR LOWER(a.description) LIKE $${params.length})`);
  }
  // Data isolation check: Ensure we only list assignments for the same campus as the teacher
  const { rows: tRows } = await query('SELECT campus_id FROM teachers WHERE id = $1', [teacherId]);
  const teacherCampusId = tRows[0]?.campus_id;
  if (teacherCampusId) {
    params.push(teacherCampusId);
    where.push(`a.campus_id = $${params.length}`);
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS count FROM assignments a ${whereSql}`, params);
  const total = countRows[0]?.count || 0;

  const { rows } = await query(
    `SELECT a.id,
            a.title,
            a.description,
            a.subject,
            a.due_date AS "dueDate",
            a.class,
            a.section,
            a.created_by AS "createdBy",
            u.name AS "createdByName",
            a.campus_id AS "campusId"
       FROM assignments a
       LEFT JOIN users u ON u.id = a.created_by
       ${whereSql}
       ORDER BY a.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, offset]
  );
  return { rows, total, page, pageSize };
};

// List assignments for a specific student's class/section
export const listByStudent = async (student, { page = 1, pageSize = 50, q }) => {
  await ensureAssignmentSubmissionSchema();
  const offset = (page - 1) * pageSize;
  const studentId = Number(student.id);
  const params = [];
  const where = [];

  if (student.class) {
    params.push(student.class);
    where.push(`(a.class = $${params.length} OR a.class IS NULL)`);
  }
  if (student.section) {
    params.push(student.section);
    where.push(`(a.section = $${params.length} OR a.section IS NULL)`);
  }

  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(LOWER(a.title) LIKE $${params.length} OR LOWER(a.description) LIKE $${params.length})`);
  }
  if (student.campusId || student.campus_id) {
    params.push(student.campusId || student.campus_id);
    where.push(`a.campus_id = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS count FROM assignments a ${whereSql}`, params);
  const total = countRows[0]?.count || 0;

  const { rows } = await query(
    `SELECT a.id,
            a.title,
            a.description,
            a.subject,
            a.due_date AS "dueDate",
            a.class,
            a.section,
            a.created_by AS "createdBy",
            u.name AS "createdByName",
            a.campus_id AS "campusId",
            s.id AS "submissionId",
            s.submitted_at AS "submittedAt",
            s.status AS "submissionStatus",
            s.score,
            s.teacher_comment AS "teacherComment",
            s.rubric,
            s.graded_at AS "gradedAt"
       FROM assignments a
       LEFT JOIN users u ON u.id = a.created_by
       LEFT JOIN assignment_submissions s
              ON s.assignment_id = a.id
             AND s.student_id = $${params.length + 1}
       ${whereSql}
       ORDER BY a.id DESC
       LIMIT $${params.length + 2} OFFSET $${params.length + 3}`,
    [...params, studentId, pageSize, offset]
  );
  return { rows, total, page, pageSize };
};
