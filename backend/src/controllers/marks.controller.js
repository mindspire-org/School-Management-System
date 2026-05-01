import * as marksService from '../services/marks.service.js';
import * as teachersService from '../services/teachers.service.js';
import * as studentsService from '../services/students.service.js';
import * as parentsService from '../services/parents.service.js';

const normalizeSubject = (v) => String(v || '').trim();

const parseAssignmentClassEntry = (entry) => {
  if (entry === undefined || entry === null) return null;
  if (typeof entry === 'string' || typeof entry === 'number') {
    const raw = String(entry).trim();
    if (!raw) return null;
    // Support formats: "10A", "10-A", "10::A", "10 A"
    if (raw.includes('::')) {
      const [c, s] = raw.split('::');
      const className = String(c || '').trim();
      const section = String(s || '').trim();
      return className && section ? { className, section } : null;
    }
    if (raw.includes('-')) {
      const parts = raw.split('-').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) return { className: parts[0], section: parts.slice(1).join('-') };
    }
    const match = raw.match(/^\s*(\d+)\s*([A-Za-z]+)\s*$/);
    if (match) return { className: match[1], section: match[2] };
    // fallback: no section
    return null;
  }
  if (typeof entry === 'object') {
    const className = String(entry.className || entry.class_name || entry.class || entry.name || '').trim();
    const section = String(entry.section || entry.sectionName || '').trim();
    if (className && section) return { className, section };
  }
  return null;
};

const buildTeacherAllowedMap = (assignments = []) => {
  // Map: subjectLower -> Set("className::section")
  const map = new Map();
  for (const a of assignments) {
    const subj = String(a.subjectName || '').trim();
    if (!subj) continue;
    const key = subj.toLowerCase();
    if (!map.has(key)) map.set(key, new Set());
    const set = map.get(key);
    const classes = Array.isArray(a.classes) ? a.classes : [];
    for (const c of classes) {
      const parsed = parseAssignmentClassEntry(c);
      if (!parsed?.className || !parsed?.section) continue;
      set.add(`${parsed.className}::${parsed.section}`);
    }
  }
  return map;
};

export const bulkUpsert = async (req, res, next) => {
  try {
    const campusId = req.user?.campusId || null;
    const { examId, items } = req.body || {};
    const rows = Array.isArray(items) ? items : [];

    if (!examId) return res.status(400).json({ message: 'examId is required' });
    if (!rows.length) return res.json({ items: [] });

    // Teacher: validate by teacher_subject_assignments
    if (req.user?.role === 'teacher') {
      const teacher = await teachersService.getByUserId(req.user.id);
      if (!teacher) return res.status(403).json({ message: 'Forbidden' });

      const assignments = await teachersService.listSubjectAssignments({ teacherId: teacher.id, campusId });
      const allowed = buildTeacherAllowedMap(assignments);

      // Preload student classes
      const studentIds = Array.from(new Set(rows.map((r) => Number(r.studentId)).filter((n) => Number.isFinite(n))));
      if (!studentIds.length) return res.json({ items: [] });

      const students = await Promise.all(studentIds.map((id) => studentsService.getById(id).catch(() => null)));
      const stMap = new Map();
      students.filter(Boolean).forEach((s) => stMap.set(Number(s.id), s));

      const rejected = [];
      const filtered = [];

      for (const r of rows) {
        const sid = Number(r.studentId);
        const subject = normalizeSubject(r.subject);
        if (!Number.isFinite(sid) || !subject) {
          rejected.push({ studentId: r.studentId, subject: r.subject, reason: 'Invalid studentId/subject' });
          continue;
        }
        const st = stMap.get(sid);
        if (!st) {
          rejected.push({ studentId: sid, subject, reason: 'Student not found' });
          continue;
        }

        const subjKey = subject.toLowerCase();
        const set = allowed.get(subjKey);
        const clsKey = `${st.class}::${st.section}`;
        if (!set || !set.has(clsKey)) {
          rejected.push({ studentId: sid, subject, reason: 'Not assigned to this class/subject' });
          continue;
        }

        filtered.push({
          studentId: sid,
          subject,
          marks: r.marks,
          grade: r.grade,
        });
      }

      const saved = await marksService.bulkUpsert({ examId, items: filtered, campusId });
      return res.json({ items: saved, rejected });
    }

    // Admin/Owner: allow upsert for any.
    const normalized = rows
      .map((r) => ({
        studentId: Number(r.studentId),
        subject: normalizeSubject(r.subject),
        marks: r.marks,
        grade: r.grade,
      }))
      .filter((r) => Number.isFinite(r.studentId) && r.subject);

    const saved = await marksService.bulkUpsert({ examId, items: normalized, campusId });
    return res.json({ items: saved });
  } catch (e) {
    next(e);
  }
};

export const getResultCard = async (req, res, next) => {
  try {
    const { studentId, examId } = req.query;

    const sid = Number(studentId);
    if (!Number.isFinite(sid)) return res.status(400).json({ message: 'studentId is required' });

    if (req.user?.role === 'student') {
      const self = await studentsService.getByUserId(req.user.id);
      if (!self || Number(self.id) !== sid) return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user?.role === 'parent') {
      const parent = await parentsService.getByUserId(req.user.id);
      if (!parent) return res.status(403).json({ message: 'Forbidden' });
      const kids = await studentsService.list({ familyNumber: parent.familyNumber, pageSize: 1000, campusId: req.user?.campusId });
      const allowed = new Set((kids?.rows || []).map((k) => Number(k.id)));
      if (!allowed.has(sid)) return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user?.role === 'teacher') {
      const teacher = await teachersService.getByUserId(req.user.id);
      if (!teacher) return res.status(403).json({ message: 'Forbidden' });
      const st = await studentsService.getById(sid);
      if (!st) return res.status(404).json({ message: 'Student not found' });

      const assignments = await teachersService.listSubjectAssignments({ teacherId: teacher.id, campusId: req.user?.campusId });
      const allowedClassSections = new Set();
      (assignments || []).forEach((a) => {
        const classes = Array.isArray(a.classes) ? a.classes : [];
        classes.forEach((c) => {
          const parsed = parseAssignmentClassEntry(c);
          if (parsed?.className && parsed?.section) allowedClassSections.add(`${parsed.className}::${parsed.section}`);
        });
      });
      const key = `${st.class}::${st.section}`;
      if (!allowedClassSections.has(key)) return res.status(403).json({ message: 'Forbidden' });
    }

    const data = await marksService.getStudentResultCard({
      studentId: Number(studentId),
      examId: Number(examId),
      campusId: req.user?.campusId,
    });
    return res.json(data);
  } catch (e) {
    next(e);
  }
};

export const listEntries = async (req, res, next) => {
  try {
    const campusId = req.user?.campusId || null;
    const { examId, className, section, subject } = req.query;

    if (req.user?.role === 'teacher') {
      const teacher = await teachersService.getByUserId(req.user.id);
      if (!teacher) return res.status(403).json({ message: 'Forbidden' });
      const assignments = await teachersService.listSubjectAssignments({ teacherId: teacher.id, campusId });
      const allowed = buildTeacherAllowedMap(assignments);
      const subjKey = String(subject || '').trim().toLowerCase();
      const clsKey = `${String(className || '').trim()}::${String(section || '').trim()}`;
      const set = allowed.get(subjKey);
      if (!set || !set.has(clsKey)) return res.status(403).json({ message: 'Forbidden' });
    }

    const rows = await marksService.listEntries({ examId, className, section, subject, campusId });
    return res.json({ rows });
  } catch (e) {
    next(e);
  }
};
