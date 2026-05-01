import * as service from '../services/settings.service.js';

export const list = async (req, res, next) => {
  try { res.json({ items: await service.list() }); } catch (e) { next(e); }
};

export const getByKey = async (req, res, next) => {
  try {
    const item = await service.getByKey(req.params.key);
    if (!item) {
      return res.json({ key: req.params.key, value: null, updatedAt: null });
    }
    res.json(item);
  } catch (e) { next(e); }
};

export const setKey = async (req, res, next) => {
  try {
    const item = await service.setKey(req.params.key, req.body.value);
    res.json(item);
  } catch (e) { next(e); }
};

export const removeKey = async (req, res, next) => {
  try { await service.removeKey(req.params.key); res.json({ success: true }); } catch (e) { next(e); }
};
