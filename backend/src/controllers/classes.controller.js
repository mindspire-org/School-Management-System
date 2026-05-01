import * as classService from '../services/classes.service.js';
import * as studentsSvc from '../services/students.service.js';

const resolveCampusId = (req) => {
  const headerCampusId =
    req.headers?.['x-campus-id'] ??
    req.headers?.['x-campusid'] ??
    req.headers?.['campus-id'] ??
    req.headers?.['campusid'];
  const id = headerCampusId ?? req.user?.campusId;
  const num = Number(id);
  return Number.isFinite(num) && num > 0 ? num : null;
};

const coerceString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const str = typeof value === 'string' ? value.trim() : String(value).trim();
  return str.length ? str : null;
};

const coerceNumber = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const coerceBoolean = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const str = String(value).trim().toLowerCase();
  if (str === 'true' || str === '1' || str === 'yes') return true;
  if (str === 'false' || str === '0' || str === 'no') return false;
  return undefined;
};

const normalizeClassPayload = (raw = {}, { partial = false } = {}) => {
  const data = {};

  const assignString = (field, source = field) => {
    const value = coerceString(raw[source]);
    if (value !== undefined) data[field] = value;
  };

  const assignNumber = (field, source = field) => {
    const value = coerceNumber(raw[source]);
    if (value !== undefined) data[field] = value;
  };

  const assignBoolean = (field, source = field) => {
    const value = coerceBoolean(raw[source]);
    if (value !== undefined) data[field] = value;
  };

  assignString('className');
  assignString('section');
  assignString('academicYear');
  assignString('room');
  assignString('medium');
  assignString('shift');
  assignString('status');
  assignString('notes');

  assignBoolean('isShared', 'isShared');

  assignNumber('classTeacherId');
  assignNumber('capacity');
  assignNumber('enrolledStudents');
  assignNumber('campusId');

  const strength = coerceNumber(raw.strength);
  if (strength !== undefined) data.enrolledStudents = strength;

  if (!partial) {
    if (!('academicYear' in data) || data.academicYear === null) data.academicYear = '';
    if (!('status' in data) || !data.status) data.status = 'active';
  }

  return data;
};

export const list = async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 50,
      search,
      className,
      section,
      academicYear,
      status,
      teacherId,
    } = req.query;

    // If teacher is logged in, filter to only their assigned classes
    let filterTeacherId = teacherId;
    if (req.user?.role === 'teacher') {
      const teacher = await classService.getTeacherByUserId(req.user.id);
      if (!teacher) return res.json({ rows: [], total: 0, page, pageSize });
      filterTeacherId = teacher.id;
    }

    // Student: only allow listing their own class/section
    let effectiveClassName = className;
    let effectiveSection = section;
    if (req.user?.role === 'student') {
      const self = await studentsSvc.getByUserId(req.user.id);
      effectiveClassName = self?.class || className;
      effectiveSection = self?.section || section;
    }

    const result = await classService.list({
      page: Number(page),
      pageSize: Number(pageSize),
      search,
      className: effectiveClassName,
      section: effectiveSection,
      academicYear,
      status,
      teacherId: filterTeacherId ? Number(filterTeacherId) : undefined,
      campusId: resolveCampusId(req),
    });
    return res.json(result);
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const record = await classService.getById(Number(req.params.id));
    if (!record) return res.status(404).json({ message: 'Class section not found' });
    return res.json(record);
  } catch (e) {
    next(e);
  }
};

export const create = async (req, res, next) => {
  try {
    const payload = normalizeClassPayload({ ...req.body, campusId: resolveCampusId(req) }, { partial: false });
    const created = await classService.create(payload);
    return res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const payload = normalizeClassPayload(req.body, { partial: true });
    const updated = await classService.update(Number(req.params.id), payload);
    if (!updated) return res.status(404).json({ message: 'Class section not found' });
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const ok = await classService.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ message: 'Class section not found' });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

export const getSubjects = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const items = await classService.getSubjectsByClassId(id);
    return res.json({ items });
  } catch (e) { next(e); }
};

export const upsertSubjects = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const items = Array.isArray(req.body) ? req.body : [];
    const saved = await classService.upsertClassSubjects(id, items);
    return res.status(201).json({ items: saved });
  } catch (e) { next(e); }
};

export const listSubjectsByClassSection = async (req, res, next) => {
  try {
    let { className, section } = req.query;
    if (req.user?.role === 'student') {
      const self = await studentsSvc.getByUserId(req.user.id);
      className = self?.class || className;
      section = self?.section || section;
    }
    const items = await classService.listSubjectsByClassSection({ className, section, campusId: req.user?.campusId });
    return res.json({ items });
  } catch (e) { next(e); }
};
