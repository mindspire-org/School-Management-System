import * as syllabus from '../services/syllabus.service.js';

const coerceString = (v) => {
  if (v === undefined) return undefined; if (v === null) return null; const s = String(v).trim(); return s.length ? s : null;
};
const coerceNumber = (v) => {
  if (v === undefined) return undefined; if (v === null || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null;
};

const toIsoDate = (v) => {
  if (v === undefined || v === null || v === '') return null;
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return null;
  }
};

export const list = async (req, res, next) => {
  try {
    const filters = {
      className: coerceString(req.query.className ?? req.query.class),
      section: coerceString(req.query.section),
      subject: coerceString(req.query.subject),
      teacherId: coerceNumber(req.query.teacherId),
      search: coerceString(req.query.q ?? req.query.search),
      campusId: req.user?.campusId,
    };
    const rows = await syllabus.list(filters);
    return res.json(rows);
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    const row = await syllabus.getById(Number(req.params.id));
    if (!row) return res.status(404).json({ message: 'Syllabus item not found' });
    return res.json(row);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const payload = {
      className: coerceString(req.body.className ?? req.body.class),
      section: coerceString(req.body.section),
      subject: coerceString(req.body.subject),
      teacherId: coerceNumber(req.body.teacherId),
      chapters: coerceNumber(req.body.chapters) ?? 0,
      covered: coerceNumber(req.body.covered) ?? 0,
      dueDate: toIsoDate(req.body.dueDate),
      notes: coerceString(req.body.notes),
      campusId: req.user?.campusId,
    };
    const created = await syllabus.create(payload);
    return res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    // Include only fields explicitly sent by the client to avoid overwriting others with null
    const payload = {};
    if ('className' in req.body || 'class' in req.body) payload.className = coerceString(req.body.className ?? req.body.class);
    if ('section' in req.body) payload.section = coerceString(req.body.section);
    if ('subject' in req.body) payload.subject = coerceString(req.body.subject);
    if ('teacherId' in req.body) payload.teacherId = coerceNumber(req.body.teacherId);
    if ('chapters' in req.body) payload.chapters = coerceNumber(req.body.chapters);
    if ('covered' in req.body) payload.covered = coerceNumber(req.body.covered);
    if ('dueDate' in req.body) payload.dueDate = toIsoDate(req.body.dueDate);
    if ('notes' in req.body) payload.notes = coerceString(req.body.notes);
    const updated = await syllabus.update(Number(req.params.id), payload);
    if (!updated) return res.status(404).json({ message: 'Syllabus item not found' });
    return res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    const ok = await syllabus.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ message: 'Syllabus item not found' });
    return res.json({ success: true });
  } catch (e) { next(e); }
};
