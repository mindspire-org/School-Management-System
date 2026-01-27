import * as service from '../services/notifications.service.js';

export const list = async (req, res, next) => {
  try {
    let { userId, isRead, type, page, pageSize } = req.query;
    if (req.user?.role === 'student') {
      userId = req.user?.id;
    }
    if (req.user?.role === 'parent') {
      userId = req.user?.id;
    }

    const items = await service.list({
      userId,
      type,
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
    if (req.user?.role === 'student' || req.user?.role === 'parent') {
      if (Number(item.userId) !== Number(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    if (req.user?.campusId && item.campusId && Number(item.campusId) !== Number(req.user.campusId)) {
      return res.status(404).json({ message: 'Notification not found' });
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

export const markRead = async (req, res, next) => {
  try {
    const existing = await service.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Notification not found' });

    if (req.user?.role === 'student' || req.user?.role === 'parent') {
      if (Number(existing.userId) !== Number(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    if (req.user?.campusId && existing.campusId && Number(existing.campusId) !== Number(req.user.campusId)) {
      return res.status(404).json({ message: 'Notification not found' });
    }

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
