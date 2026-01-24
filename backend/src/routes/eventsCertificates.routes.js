import { Router } from 'express';
import { Event, Certificate, QRAttendance } from '../models/index.js';

const router = Router();

const createCRUD = (Model) => ({
    getAll: async (req, res) => {
        try {
            const { campusId } = req.query;
            const where = campusId ? { campusId } : {};
            const items = await Model.findAll({ where });
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getOne: async (req, res) => {
        try {
            const item = await Model.findByPk(req.params.id);
            if (!item) return res.status(404).json({ error: 'Not found' });
            res.json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    create: async (req, res) => {
        try {
            const item = await Model.create(req.body);
            res.status(201).json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const [updated] = await Model.update(req.body, { where: { id: req.params.id } });
            if (!updated) return res.status(404).json({ error: 'Not found' });
            const item = await Model.findByPk(req.params.id);
            res.json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            const deleted = await Model.destroy({ where: { id: req.params.id } });
            if (!deleted) return res.status(404).json({ error: 'Not found' });
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
});

// Event routes
const eventCRUD = createCRUD(Event);
router.get('/events', eventCRUD.getAll);
router.get('/events/:id', eventCRUD.getOne);
router.post('/events', eventCRUD.create);
router.put('/events/:id', eventCRUD.update);
router.delete('/events/:id', eventCRUD.delete);

// Certificate routes
const certificateCRUD = createCRUD(Certificate);
router.get('/certificates', certificateCRUD.getAll);
router.get('/certificates/:id', certificateCRUD.getOne);
router.post('/certificates', certificateCRUD.create);
router.put('/certificates/:id', certificateCRUD.update);
router.delete('/certificates/:id', certificateCRUD.delete);

// QR Attendance routes
const qrAttendanceCRUD = createCRUD(QRAttendance);
router.get('/qr-attendance', qrAttendanceCRUD.getAll);
router.get('/qr-attendance/:id', qrAttendanceCRUD.getOne);
router.post('/qr-attendance', qrAttendanceCRUD.create);
router.put('/qr-attendance/:id', qrAttendanceCRUD.update);
router.delete('/qr-attendance/:id', qrAttendanceCRUD.delete);

export default router;
