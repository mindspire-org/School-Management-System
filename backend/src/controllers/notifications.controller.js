import * as service from '../services/notifications.service.js';

export const list = async (req, res, next) => {
  try {
    const { userId, isRead, page, pageSize } = req.query;
    const items = await service.list({
      userId,
      isRead: typeof isRead !== 'undefined' ? isRead === 'true' : undefined,
      page,
      pageSize,
      campusId: req.user?.campusId
    });
    res.json({ items });
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    const item = await service.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Notification not found' });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const item = await service.create({ ...req.body, campusId: req.user?.campusId });
    res.status(201).json(item);
  } catch (e) { next(e); }
};

export const markRead = async (req, res, next) => {
  try {
    const item = await service.markRead(req.params.id);
    if (!item) return res.status(404).json({ message: 'Notification not found' });
    res.json(item);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
};
