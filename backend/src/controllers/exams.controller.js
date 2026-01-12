import * as service from '../services/exams.service.js';

export const list = async (req, res, next) => {
  try {
    const { q, className, section, fromDate, toDate, page, pageSize } = req.query;
    const items = await service.listExams({
      q, className, section, fromDate, toDate, page, pageSize,
      campusId: req.user?.campusId
    });
    res.json({ items });
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    const item = await service.getExamById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Exam not found' });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const item = await service.createExam({ ...req.body, campusId: req.user?.campusId });
    res.status(201).json(item);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const item = await service.updateExam(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'Exam not found' });
    res.json(item);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await service.deleteExam(req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
};
