import * as rfid from '../services/rfid.service.js';

export const list = async (req, res, next) => {
  try {
    const { q, status, location, bus, date, startDate, endDate, page, pageSize } = req.query;
    const campusId = req.user?.campusId;
    const data = await rfid.list({ q, status, location, bus, date, startDate, endDate, campusId, page, pageSize });
    res.json(data);
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    const row = await rfid.getById(Number(req.params.id));
    if (!row) return res.status(404).json({ message: 'Log not found' });
    res.json(row);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const created = await rfid.create(req.body || {});
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const row = await rfid.update(Number(req.params.id), req.body || {});
    if (!row) return res.status(404).json({ message: 'Log not found' });
    res.json(row);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    const ok = await rfid.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ message: 'Log not found' });
    res.json({ success: true });
  } catch (e) { next(e); }
};
