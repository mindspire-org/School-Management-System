import { query } from '../config/db.js';

export const listForTeacher = async ({ teacherId, type, status, subjectId, className, section, q, campusId }) => {
  const params = [teacherId];
  const where = ['sc.teacher_id = $1'];

  if (type) {
    params.push(type);
    where.push(`sc.type = $${params.length}`);
  }
  if (status) {
    params.push(status);
    where.push(`sc.status = $${params.length}`);
  }
  if (subjectId) {
    params.push(Number(subjectId));
    where.push(`sc.subject_id = $${params.length}`);
  }
  if (className) {
    params.push(String(className));
    where.push(`sc.class_name = $${params.length}`);
  }
  if (section) {
    params.push(String(section));
    where.push(`sc.section = $${params.length}`);
  }
  if (q) {
    params.push(`%${String(q).toLowerCase()}%`);
    where.push(`(LOWER(sc.title) LIKE $${params.length} OR LOWER(COALESCE(sc.description,'')) LIKE $${params.length})`);
  }
  if (campusId) {
    params.push(Number(campusId));
    where.push(`sc.campus_id = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows } = await query(
    `SELECT sc.id,
            sc.type,
            sc.title,
            sc.description,
            sc.url,
            sc.subject_id AS "subjectId",
            subj.name AS "subjectName",
            sc.class_name AS "className",
            sc.section,
            sc.status,
            sc.teacher_id AS "teacherId",
            t.name AS "teacherName",
            sc.created_at AS "createdAt",
            sc.published_at AS "publishedAt",
            sc.campus_id AS "campusId"
       FROM shared_contents sc
       LEFT JOIN subjects subj ON subj.id = sc.subject_id
       LEFT JOIN teachers t ON t.id = sc.teacher_id
       ${whereSql}
       ORDER BY sc.created_at DESC`,
    params
  );
  return rows;
};

export const listForStudent = async ({ studentId, type, subjectId, q, campusId }) => {
  const { rows: stRows } = await query('SELECT class, section, campus_id FROM students WHERE id = $1', [studentId]);
  const st = stRows[0];
  if (!st?.class) return [];

  const className = String(st.class);
  const section = st.section ? String(st.section) : null;

  const params = [];
  const where = ['sc.status = \'published\''];

  params.push(className);
  where.push(`(sc.class_name = $${params.length} OR sc.class_name IS NULL)`);

  if (section) {
    params.push(section);
    where.push(`(sc.section = $${params.length} OR sc.section IS NULL)`);
  }

  if (type) {
    params.push(type);
    where.push(`sc.type = $${params.length}`);
  }

  if (subjectId) {
    params.push(Number(subjectId));
    where.push(`sc.subject_id = $${params.length}`);
  }

  if (q) {
    params.push(`%${String(q).toLowerCase()}%`);
    where.push(`(LOWER(sc.title) LIKE $${params.length} OR LOWER(COALESCE(sc.description,'')) LIKE $${params.length})`);
  }

  const effectiveCampusId = campusId || st.campus_id;
  if (effectiveCampusId) {
    params.push(Number(effectiveCampusId));
    where.push(`sc.campus_id = $${params.length}`);
  }

  const clsJson = JSON.stringify([className]);
  params.push(clsJson);
  const clsIdx = params.length;

  let classSectionJson = null;
  let classSectionIdx = null;
  if (section) {
    classSectionJson = JSON.stringify([`${className}-${section}`]);
    params.push(classSectionJson);
    classSectionIdx = params.length;
  }

  const classScopeSql = classSectionIdx
    ? `(tsa.classes @> $${clsIdx}::jsonb OR tsa.classes @> $${classSectionIdx}::jsonb)`
    : `(tsa.classes @> $${clsIdx}::jsonb)`;

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows } = await query(
    `SELECT sc.id,
            sc.type,
            sc.title,
            sc.description,
            sc.url,
            sc.subject_id AS "subjectId",
            subj.name AS "subjectName",
            sc.class_name AS "className",
            sc.section,
            sc.status,
            sc.teacher_id AS "teacherId",
            t.name AS "teacherName",
            sc.created_at AS "createdAt",
            sc.published_at AS "publishedAt",
            sc.campus_id AS "campusId"
       FROM shared_contents sc
       JOIN teacher_subject_assignments tsa
         ON tsa.teacher_id = sc.teacher_id
        AND tsa.subject_id = sc.subject_id
        AND ${classScopeSql}
       LEFT JOIN subjects subj ON subj.id = sc.subject_id
       LEFT JOIN teachers t ON t.id = sc.teacher_id
       ${whereSql}
       ORDER BY COALESCE(sc.published_at, sc.created_at) DESC`,
    params
  );
  return rows;
};

export const isTeacherAllowedToPublish = async ({ teacherId, subjectId, className, section, campusId }) => {
  if (!teacherId || !subjectId) return false;
  const params = [teacherId, Number(subjectId)];
  let campusSql = '';
  if (campusId) {
    params.push(Number(campusId));
    campusSql = `AND t.campus_id = $${params.length}`;
  }

  const clsJson = JSON.stringify([String(className)]);
  params.push(clsJson);
  const clsIdx = params.length;

  let classSectionIdx = null;
  if (className && section) {
    params.push(JSON.stringify([`${String(className)}-${String(section)}`]));
    classSectionIdx = params.length;
  }

  const classScopeSql = classSectionIdx
    ? `(tsa.classes @> $${clsIdx}::jsonb OR tsa.classes @> $${classSectionIdx}::jsonb)`
    : `(tsa.classes @> $${clsIdx}::jsonb)`;

  const { rows } = await query(
    `SELECT tsa.id
       FROM teacher_subject_assignments tsa
       JOIN teachers t ON t.id = tsa.teacher_id
      WHERE tsa.teacher_id = $1
        AND tsa.subject_id = $2
        AND ${classScopeSql}
        ${campusSql}
      LIMIT 1`,
    params
  );
  return !!rows?.length;
};

export const create = async ({ teacherId, type, title, description, url, subjectId, className, section, campusId, status }) => {
  const { rows } = await query(
    `INSERT INTO shared_contents (teacher_id, type, title, description, url, subject_id, class_name, section, status, campus_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      teacherId,
      type,
      title,
      description || null,
      url || null,
      subjectId ? Number(subjectId) : null,
      className || null,
      section || null,
      status || 'draft',
      campusId || null,
    ]
  );
  return rows[0]?.id || null;
};

export const update = async (id, { type, title, description, url, subjectId, className, section, status }) => {
  const updates = [];
  const params = [Number(id)];

  const add = (sql, val) => {
    params.push(val);
    updates.push(`${sql} = $${params.length}`);
  };

  if (typeof type !== 'undefined') add('type', type || null);
  if (typeof title !== 'undefined') add('title', title || null);
  if (typeof description !== 'undefined') add('description', description || null);
  if (typeof url !== 'undefined') add('url', url || null);
  if (typeof subjectId !== 'undefined') add('subject_id', subjectId ? Number(subjectId) : null);
  if (typeof className !== 'undefined') add('class_name', className || null);
  if (typeof section !== 'undefined') add('section', section || null);
  if (typeof status !== 'undefined') add('status', status || null);

  if (!updates.length) return await getById(id);

  updates.push('updated_at = NOW()');

  const { rowCount } = await query(
    `UPDATE shared_contents SET ${updates.join(', ')} WHERE id = $1`,
    params
  );

  if (!rowCount) return null;
  return await getById(id);
};

export const setPublished = async (id, published) => {
  const { rows } = await query(
    `UPDATE shared_contents
        SET status = $2,
            published_at = CASE WHEN $2 = 'published' THEN NOW() ELSE NULL END,
            updated_at = NOW()
      WHERE id = $1
      RETURNING id`,
    [Number(id), published ? 'published' : 'draft']
  );
  return rows[0]?.id ? await getById(rows[0].id) : null;
};

export const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM shared_contents WHERE id = $1', [Number(id)]);
  return rowCount > 0;
};

export const getById = async (id) => {
  const { rows } = await query(
    `SELECT sc.id,
            sc.type,
            sc.title,
            sc.description,
            sc.url,
            sc.subject_id AS "subjectId",
            subj.name AS "subjectName",
            sc.class_name AS "className",
            sc.section,
            sc.status,
            sc.teacher_id AS "teacherId",
            t.name AS "teacherName",
            sc.created_at AS "createdAt",
            sc.published_at AS "publishedAt",
            sc.campus_id AS "campusId"
       FROM shared_contents sc
       LEFT JOIN subjects subj ON subj.id = sc.subject_id
       LEFT JOIN teachers t ON t.id = sc.teacher_id
      WHERE sc.id = $1`,
    [Number(id)]
  );
  return rows[0] || null;
};
