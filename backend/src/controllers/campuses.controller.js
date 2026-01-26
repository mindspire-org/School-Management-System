import * as campusSvc from '../services/campuses.service.js';

export const list = async (req, res, next) => {
    try {
        if (req.user?.role === 'admin') {
            const campusId = req.user?.campusId;
            if (!campusId) return res.json({ rows: [], total: 0, page: 1, pageSize: 50 });
            const campus = await campusSvc.getById(campusId);
            return res.json({ rows: campus ? [campus] : [], total: campus ? 1 : 0, page: 1, pageSize: 50 });
        }
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
        if (req.user?.role === 'admin') {
            const campusId = req.user?.campusId;
            if (!campusId || Number(req.params.id) !== Number(campusId)) {
                return res.status(404).json({ message: 'Campus not found' });
            }
        }
        const campus = await campusSvc.getById(req.params.id);
        if (!campus) return res.status(404).json({ message: 'Campus not found' });
        return res.json(campus);
    } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
    try {
        if (req.user?.role === 'admin') return res.status(403).json({ message: 'Forbidden' });
        const { name, address, phone, email, capacity, status } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const campus = await campusSvc.create({
            name,
            address,
            phone,
            email,
            capacity: capacity === '' || capacity === undefined ? null : Number(capacity),
            status
        });
        return res.status(201).json(campus);
    } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
    try {
        if (req.user?.role === 'admin') return res.status(403).json({ message: 'Forbidden' });
        const { name, address, phone, email, capacity, status } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const campus = await campusSvc.update(req.params.id, {
            name,
            address,
            phone,
            email,
            capacity: capacity === '' || capacity === undefined ? null : Number(capacity),
            status
        });
        if (!campus) return res.status(404).json({ message: 'Campus not found' });
        return res.json(campus);
    } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
    try {
        if (req.user?.role === 'admin') return res.status(403).json({ message: 'Forbidden' });
        const deleted = await campusSvc.remove(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Campus not found' });
        return res.json({ message: 'Campus deleted successfully' });
    } catch (e) { next(e); }
};
