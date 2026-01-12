import * as campusSvc from '../services/campuses.service.js';

export const list = async (req, res, next) => {
    try {
        const { page, pageSize, q } = req.query;
        const result = await campusSvc.list({
            page: Number(page) || 1,
            pageSize: Number(pageSize) || 50,
            q
        });
        return res.json(result);
    } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
    try {
        const campus = await campusSvc.getById(req.params.id);
        if (!campus) return res.status(404).json({ message: 'Campus not found' });
        return res.json(campus);
    } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
    try {
        const { name, address, phone } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const campus = await campusSvc.create({ name, address, phone });
        return res.status(201).json(campus);
    } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
    try {
        const { name, address, phone } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const campus = await campusSvc.update(req.params.id, { name, address, phone });
        if (!campus) return res.status(404).json({ message: 'Campus not found' });
        return res.json(campus);
    } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
    try {
        const deleted = await campusSvc.remove(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Campus not found' });
        return res.json({ message: 'Campus deleted successfully' });
    } catch (e) { next(e); }
};
