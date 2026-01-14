import * as service from '../services/results.service.js';
import * as studentsSvc from '../services/students.service.js';
import * as teachersSvc from '../services/teachers.service.js';
import * as parentsSvc from '../services/parents.service.js';

export const list = async (req, res, next) => {
  try {
    let { examId, studentId, subject, className, section, q, page, pageSize } = req.query;

    let allowedStudentIds;
    let allowedClassSections;

    if (req.user?.role === 'student') {
      const self = await studentsSvc.getByUserId(req.user.id);
      studentId = self?.id;
    }

    if (req.user?.role === 'parent') {
      const parent = await parentsSvc.getByUserId(req.user.id);
      if (!parent) return res.json({ items: [] });
      const kids = await studentsSvc.list({ familyNumber: parent.familyNumber, pageSize: 1000, campusId: req.user?.campusId });
      allowedStudentIds = kids.rows.map((k) => k.id);
    }

    if (req.user?.role === 'teacher') {
      allowedClassSections = await teachersSvc.getTeachingScopesByUserId(req.user.id);
      if (!allowedClassSections.length) return res.json({ items: [] });
    }

    const items = await service.list({
      examId, studentId, subject, className, section, q, page, pageSize,
      campusId: req.user?.campusId,
      allowedStudentIds,
      allowedClassSections,
    });
    res.json({ items });
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    const item = await service.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Result not found' });

    if (req.user?.role === 'student') {
      const self = await studentsSvc.getByUserId(req.user.id);
      if (!self || Number(self.id) !== Number(item.studentId)) return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user?.role === 'parent') {
      const parent = await parentsSvc.getByUserId(req.user.id);
      if (!parent) return res.status(403).json({ message: 'Forbidden' });
      const kids = await studentsSvc.list({ familyNumber: parent.familyNumber, pageSize: 1000, campusId: req.user?.campusId });
      const allowedIds = new Set(kids.rows.map((k) => Number(k.id)));
      if (!allowedIds.has(Number(item.studentId))) return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user?.role === 'teacher') {
      const scopes = await teachersSvc.getTeachingScopesByUserId(req.user.id);
      const ok = scopes.some((s) => {
        if (!s?.className) return false;
        if (String(s.className) !== String(item.class)) return false;
        if (s.section) return String(s.section) === String(item.section);
        return true;
      });
      if (!ok) return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const item = await service.create({ ...req.body, campusId: req.user?.campusId });
    res.status(201).json(item);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const item = await service.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'Result not found' });
    res.json(item);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
};

export const bulkCreate = async (req, res, next) => {
  try {
    const rawItems = Array.isArray(req.body) ? req.body : [];
    const items = rawItems.map(it => ({ ...it, campusId: req.user?.campusId }));
    const created = await service.bulkCreate(items);
    res.status(201).json({ items: created });
  } catch (e) { next(e); }
};
