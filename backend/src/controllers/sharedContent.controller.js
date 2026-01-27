import * as service from '../services/sharedContent.service.js';
import * as teachersSvc from '../services/teachers.service.js';
import * as studentsSvc from '../services/students.service.js';

export const list = async (req, res, next) => {
  try {
    const { type, status, subjectId, className, section, q } = req.query;

    if (req.user?.role === 'teacher') {
      const teacher = await teachersSvc.getByUserId(req.user.id);
      if (!teacher) return res.json({ items: [] });

      const items = await service.listForTeacher({
        teacherId: teacher.id,
        type,
        status,
        subjectId,
        className,
        section,
        q,
        campusId: req.user?.campusId,
      });
      return res.json({ items });
    }

    if (req.user?.role === 'student') {
      const student = await studentsSvc.getByUserId(req.user.id);
      if (!student) return res.json({ items: [] });

      const items = await service.listForStudent({
        studentId: student.id,
        type,
        subjectId,
        q,
        campusId: req.user?.campusId,
      });
      return res.json({ items });
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const item = await service.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Content not found' });

    if (req.user?.role === 'teacher') {
      const teacher = await teachersSvc.getByUserId(req.user.id);
      if (!teacher || Number(item.teacherId) !== Number(teacher.id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    if (req.user?.role === 'student') {
      const student = await studentsSvc.getByUserId(req.user.id);
      if (!student) return res.status(404).json({ message: 'Student profile not found' });

      const items = await service.listForStudent({
        studentId: student.id,
        type: item.type,
        subjectId: item.subjectId,
        q: item.title,
        campusId: req.user?.campusId,
      });
      const ok = items.some((x) => Number(x.id) === Number(item.id));
      if (!ok) return res.status(403).json({ message: 'Forbidden' });
    }

    return res.json(item);
  } catch (e) {
    next(e);
  }
};

export const create = async (req, res, next) => {
  try {
    if (req.user?.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const teacher = await teachersSvc.getByUserId(req.user.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const allowed = await service.isTeacherAllowedToPublish({
      teacherId: teacher.id,
      subjectId: req.body.subjectId,
      className: req.body.className,
      section: req.body.section,
      campusId: req.user?.campusId,
    });
    if (!allowed) return res.status(403).json({ message: 'Not assigned to this class/subject' });

    const id = await service.create({
      teacherId: teacher.id,
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      url: req.body.url,
      subjectId: req.body.subjectId,
      className: req.body.className,
      section: req.body.section,
      status: req.body.status,
      campusId: req.user?.campusId,
    });

    const item = await service.getById(id);
    return res.status(201).json(item);
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    if (req.user?.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const teacher = await teachersSvc.getByUserId(req.user.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const existing = await service.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Content not found' });
    if (Number(existing.teacherId) !== Number(teacher.id)) return res.status(403).json({ message: 'Forbidden' });

    const nextSubjectId = req.body.subjectId ?? existing.subjectId;
    const nextClassName = req.body.className ?? existing.className;
    const nextSection = req.body.section ?? existing.section;

    const allowed = await service.isTeacherAllowedToPublish({
      teacherId: teacher.id,
      subjectId: nextSubjectId,
      className: nextClassName,
      section: nextSection,
      campusId: req.user?.campusId,
    });
    if (!allowed) return res.status(403).json({ message: 'Not assigned to this class/subject' });

    const updated = await service.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Content not found' });
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const publish = async (req, res, next) => {
  try {
    if (req.user?.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const teacher = await teachersSvc.getByUserId(req.user.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const existing = await service.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Content not found' });
    if (Number(existing.teacherId) !== Number(teacher.id)) return res.status(403).json({ message: 'Forbidden' });

    const item = await service.setPublished(req.params.id, true);
    return res.json(item);
  } catch (e) {
    next(e);
  }
};

export const unpublish = async (req, res, next) => {
  try {
    if (req.user?.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const teacher = await teachersSvc.getByUserId(req.user.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const existing = await service.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Content not found' });
    if (Number(existing.teacherId) !== Number(teacher.id)) return res.status(403).json({ message: 'Forbidden' });

    const item = await service.setPublished(req.params.id, false);
    return res.json(item);
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    if (req.user?.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const teacher = await teachersSvc.getByUserId(req.user.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const existing = await service.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Content not found' });
    if (Number(existing.teacherId) !== Number(teacher.id)) return res.status(403).json({ message: 'Forbidden' });

    await service.remove(req.params.id);
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};
