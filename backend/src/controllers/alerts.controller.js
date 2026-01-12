import * as alerts from '../services/alerts.service.js';

export const list = async (req, res, next) => {
  try {
    const { severity, status, q, fromDate, toDate, page, pageSize, targetUserId } = req.query;
    const items = await alerts.list({
      severity, status, q, fromDate, toDate, targetUserId, page, pageSize,
      campusId: req.user?.campusId
    });
    res.json({ items });
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const { message, severity, type, targetUserId } = req.body;
    const createdBy = req.user?.id;
    const row = await alerts.create({
      message, severity, type, targetUserId, createdBy,
      campusId: req.user?.campusId
    });
    res.status(201).json(row);
  } catch (e) { next(e); }
};

export const markRead = async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Boolean) : [];
    const result = await alerts.markRead(ids);
    res.json(result);
  } catch (e) { next(e); }
};

export const resolve = async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Boolean) : [];
    const result = await alerts.resolve(ids);
    res.json(result);
  } catch (e) { next(e); }
};

export const listMine = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { severity, status, fromDate, toDate, page, pageSize } = req.query;
    const items = await alerts.listMine({ userId, severity, status, fromDate, toDate, page, pageSize });
    res.json({ items });
  } catch (e) { next(e); }
};

export const listRecipients = async (req, res, next) => {
  try {
    const { role, q } = req.query;
    const items = await alerts.listRecipients({
      role, q,
      campusId: req.user?.campusId
    });
    res.json({ items });
  } catch (e) { next(e); }
};
