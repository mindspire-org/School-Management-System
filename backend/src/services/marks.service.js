import { pool, query } from '../config/db.js';
import * as gradingService from './grading.service.js';

const normalizeSubjectName = (name) => String(name || '').trim();

export async function getClassSubjectFullMarks({ className, section, subjectName }) {
  const cn = String(className || '').trim();
  const sec = String(section || '').trim();
  const subj = normalizeSubjectName(subjectName);
  if (!cn || !sec || !subj) return null;

  const { rows } = await query(
    `SELECT cs.full_marks AS "fullMarks"
       FROM class_sections csec
       JOIN class_subjects cs ON cs.class_section_id = csec.id
       JOIN subjects s ON s.id = cs.subject_id
      WHERE csec.class_name = $1
        AND csec.section = $2
        AND LOWER(s.name) = LOWER($3)
      ORDER BY cs.updated_at DESC
      LIMIT 1`,
    [cn, sec, subj]
  );

  const v = rows[0]?.fullMarks;
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function computeGradeIfNeeded({ marks, fullMarks, campusId }) {
  const m = Number(marks);
  if (!Number.isFinite(m)) return null;
  const total = Number(fullMarks);
  if (!Number.isFinite(total) || total <= 0) return null;

  const pct = (m / total) * 100;
  const scheme = await gradingService.getDefaultScheme(campusId);
  const bands = scheme?.bands || {};
  return gradingService.computeGrade(pct, bands);
}

export async function bulkUpsert({ examId, items = [], campusId }) {
  const eid = Number(examId);
  if (!Number.isFinite(eid)) {
    const e = new Error('examId is required');
    e.status = 400;
    throw e;
  }

  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) return [];

  // Use a transaction for consistency.
  const conn = await pool.connect();
  try {
    await conn.query('BEGIN');

    const out = [];
    for (const it of rows) {
      const studentId = Number(it.studentId);
      const subject = normalizeSubjectName(it.subject);
      if (!Number.isFinite(studentId) || !subject) continue;

      const marks = it.marks === '' || it.marks === undefined ? null : Number(it.marks);
      const marksValue = marks === null || Number.isFinite(marks) ? marks : null;
      const gradeValue = it.grade === undefined ? null : (it.grade === null ? null : String(it.grade));

      const { rows: saved } = await conn.query(
        `INSERT INTO exam_results (exam_id, student_id, subject, marks, grade, campus_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6, NOW(), NOW())
         ON CONFLICT (exam_id, student_id, subject)
         DO UPDATE SET
           marks = EXCLUDED.marks,
           grade = EXCLUDED.grade,
           campus_id = COALESCE(EXCLUDED.campus_id, exam_results.campus_id),
           updated_at = NOW()
         RETURNING id,
                   exam_id AS "examId",
                   student_id AS "studentId",
                   subject,
                   marks,
                   grade,
                   campus_id AS "campusId"`,
        [eid, studentId, subject, marksValue, gradeValue, campusId || null]
      );
      if (saved[0]) out.push(saved[0]);
    }

    await conn.query('COMMIT');
    return out;
  } catch (err) {
    try {
      await conn.query('ROLLBACK');
    } catch (_) {}
    throw err;
  } finally {
    conn.release();
  }
}

export async function getStudentResultCard({ studentId, examId, campusId }) {
  const sid = Number(studentId);
  const eid = Number(examId);
  if (!Number.isFinite(sid) || !Number.isFinite(eid)) {
    const e = new Error('studentId and examId are required');
    e.status = 400;
    throw e;
  }

  const { rows: stRows } = await query(
    `SELECT id, name, roll_number AS "rollNumber", class AS "className", section, campus_id AS "campusId"
       FROM students
      WHERE id = $1`,
    [sid]
  );
  const student = stRows[0];
  if (!student) {
    const e = new Error('Student not found');
    e.status = 404;
    throw e;
  }

  if (campusId && student.campusId && Number(student.campusId) !== Number(campusId)) {
    const e = new Error('Forbidden');
    e.status = 403;
    throw e;
  }

  const { rows: examRows } = await query(`SELECT id, title, exam_date AS "examDate", class AS "className", section FROM exams WHERE id = $1`, [eid]);
  const exam = examRows[0] || { id: eid };

  // Subjects for class-section
  const { rows: subjRows } = await query(
    `SELECT s.name AS "subjectName", cs.full_marks AS "fullMarks"
       FROM class_sections csec
       JOIN class_subjects cs ON cs.class_section_id = csec.id
       JOIN subjects s ON s.id = cs.subject_id
      WHERE csec.class_name = $1 AND csec.section = $2
      ORDER BY s.name ASC`,
    [student.className, student.section]
  );

  const { rows: marksRows } = await query(
    `SELECT subject, marks, grade
       FROM exam_results
      WHERE exam_id = $1 AND student_id = $2`,
    [eid, sid]
  );

  const markMap = new Map();
  marksRows.forEach((r) => markMap.set(String(r.subject || '').trim().toLowerCase(), r));

  const scheme = await gradingService.getDefaultScheme(campusId || student.campusId);
  const bands = scheme?.bands || {};

  const subjects = (subjRows || []).map((s) => {
    const key = String(s.subjectName || '').trim().toLowerCase();
    const r = markMap.get(key);
    const obtained = r?.marks === undefined || r?.marks === null ? null : Number(r.marks);
    const full = s.fullMarks === undefined || s.fullMarks === null ? null : Number(s.fullMarks);
    const pct = full && obtained != null ? (obtained / full) * 100 : null;
    const grade = r?.grade || (pct != null ? gradingService.computeGrade(pct, bands) : null);
    return {
      subject: s.subjectName,
      fullMarks: Number.isFinite(full) ? full : null,
      obtainedMarks: Number.isFinite(obtained) ? obtained : null,
      percentage: pct != null && Number.isFinite(pct) ? pct : null,
      grade,
    };
  });

  const totals = subjects.reduce(
    (acc, row) => {
      acc.total += Number.isFinite(row.fullMarks) ? row.fullMarks : 0;
      acc.obtained += Number.isFinite(row.obtainedMarks) ? row.obtainedMarks : 0;
      return acc;
    },
    { total: 0, obtained: 0 }
  );

  const percentage = totals.total > 0 ? (totals.obtained / totals.total) * 100 : 0;
  const overallGrade = gradingService.computeGrade(percentage, bands);
  const passFail = percentage >= 33 ? 'Pass' : 'Fail';

  return {
    student,
    exam,
    subjects,
    totals: {
      totalMarks: totals.total,
      obtainedMarks: totals.obtained,
      percentage,
      grade: overallGrade,
      status: passFail,
    },
  };
}

export async function listEntries({ examId, className, section, subject, campusId }) {
  const eid = Number(examId);
  const cn = String(className || '').trim();
  const sec = String(section || '').trim();
  const subj = normalizeSubjectName(subject);

  if (!Number.isFinite(eid) || !cn || !sec || !subj) {
    const e = new Error('examId, className, section, and subject are required');
    e.status = 400;
    throw e;
  }

  const params = [eid, cn, sec, subj];
  let campusWhere = '';
  if (campusId) {
    params.push(Number(campusId));
    campusWhere = `AND s.campus_id = $${params.length}`;
  }

  const { rows } = await query(
    `SELECT s.id AS "studentId",
            s.name AS "studentName",
            s.roll_number AS "rollNumber",
            s.class AS "className",
            s.section,
            er.id AS "resultId",
            er.marks,
            er.grade
       FROM students s
       LEFT JOIN exam_results er
         ON er.exam_id = $1
        AND er.student_id = s.id
        AND LOWER(er.subject) = LOWER($4)
      WHERE s.status = 'active'
        AND s.class = $2
        AND s.section = $3
        ${campusWhere}
      ORDER BY COALESCE(NULLIF(s.roll_number, ''), '999999')::text ASC, s.name ASC`,
    params
  );

  return rows;
}
