import * as service from '../services/results.service.js';

export const list = async (req, res, next) => {
  try {
    const { examId, studentId, subject, className, section, q, page, pageSize } = req.query;
    const items = await service.list({
      examId, studentId, subject, className, section, q, page, pageSize,
      campusId: req.user?.campusId
    });
    res.json({ items });
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    const item = await service.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Result not found' });
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
