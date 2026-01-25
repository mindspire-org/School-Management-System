import { Router } from 'express';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { Event, Certificate, QRAttendance, QRAttendanceSession } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { query } from '../config/db.js';

const router = Router();

const toInt = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
};

const normalizeAttendanceType = (value) => {
    const v = String(value || '').toLowerCase();
    if (v === 'student') return 'Student';
    if (v === 'teacher' || v === 'staff' || v === 'employee') return 'Teacher';
    return null;
};

const todayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const getPersonById = async ({ attendanceType, personId, campusId }) => {
    const table = attendanceType === 'Student' ? 'students' : 'teachers';
    const { rows } = await query(
        `SELECT id, name FROM ${table} WHERE id = $1 AND campus_id = $2 LIMIT 1`,
        [Number(personId), Number(campusId)]
    );
    return rows[0] || null;
};

const getSelfPerson = async ({ role, userId, campusId }) => {
    if (role !== 'student' && role !== 'teacher') return null;
    const attendanceType = role === 'student' ? 'Student' : 'Teacher';
    const table = role === 'student' ? 'students' : 'teachers';
    const { rows } = await query(
        `SELECT id, name FROM ${table} WHERE user_id = $1 AND campus_id = $2 LIMIT 1`,
        [Number(userId), Number(campusId)]
    );
    const row = rows[0];
    if (!row) return null;
    return { attendanceType, personId: row.id, personName: row.name };
};

const upsertTodayAttendance = async ({ attendanceType, personId, personName, campusId, qrCode, status, markedBy }) => {
    const { start, end } = todayRange();
    const existing = await QRAttendance.findOne({
        where: {
            attendanceType,
            personId: Number(personId),
            campusId: Number(campusId),
            date: { [Op.between]: [start, end] },
        },
        order: [['createdAt', 'DESC']],
    });

    const now = new Date();
    const time = now.toLocaleTimeString();
    if (existing) {
        await existing.update({
            personName: String(personName || existing.personName || 'Unknown'),
            date: now,
            time,
            qrCode: qrCode ? String(qrCode) : existing.qrCode,
            status: status || existing.status || 'Present',
            markedBy: markedBy ? String(markedBy) : existing.markedBy,
        });
        return existing;
    }

    return await QRAttendance.create({
        attendanceType,
        personId: Number(personId),
        personName: String(personName || 'Unknown'),
        date: now,
        time,
        qrCode: qrCode ? String(qrCode) : null,
        status: status || 'Present',
        markedBy: markedBy ? String(markedBy) : null,
        campusId: Number(campusId),
    });
};

const scanSessionHandler = async (req, res) => {
    try {
        const campusId = toInt(req.user?.campusId);
        if (!campusId) return res.status(400).json({ message: 'campusId is required' });

        const role = req.user?.role;
        if (role !== 'student' && role !== 'teacher') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        let token = String(req.body?.token || req.body?.qrCode || '').trim();
        if (!token) return res.status(400).json({ message: 'token is required' });

        // Allow scanning JSON payload and extracting the token
        if (token.startsWith('{')) {
            try {
                const obj = JSON.parse(token);
                token = String(obj?.token || '').trim() || token;
            } catch (_) {}
        }

        const session = await QRAttendanceSession.findOne({ where: { token } });
        if (!session) return res.status(400).json({ message: 'Invalid QR session' });
        if (String(session.campusId) !== String(campusId)) return res.status(403).json({ message: 'Forbidden' });
        if (new Date(session.expiresAt).getTime() < Date.now()) return res.status(400).json({ message: 'QR session expired' });

        const self = await getSelfPerson({ role, userId: req.user.id, campusId });
        if (!self) return res.status(404).json({ message: 'Profile not found' });
        if (String(self.attendanceType) !== String(session.attendanceType)) {
            return res.status(400).json({ message: `This QR is for ${session.attendanceType} attendance` });
        }

        const record = await upsertTodayAttendance({
            attendanceType: self.attendanceType,
            personId: self.personId,
            personName: self.personName,
            campusId,
            qrCode: token,
            status: 'Present',
            markedBy: req.user?.name || req.user?.email || 'self',
        });

        return res.json(record);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const markPersonHandler = async (req, res) => {
    try {
        const campusId = toInt(req.user?.campusId);
        if (!campusId) return res.status(400).json({ message: 'campusId is required' });

        const attendanceType = normalizeAttendanceType(req.body?.attendanceType);
        const personId = toInt(req.body?.personId);
        if (!attendanceType) return res.status(400).json({ message: 'attendanceType is required' });
        if (!personId) return res.status(400).json({ message: 'personId is required' });

        const person = await getPersonById({ attendanceType, personId, campusId });
        if (!person) return res.status(404).json({ message: `${attendanceType} not found` });

        const record = await upsertTodayAttendance({
            attendanceType,
            personId: person.id,
            personName: req.body?.personName ? String(req.body.personName) : person.name,
            campusId,
            qrCode: req.body?.qrCode ? String(req.body.qrCode) : null,
            status: req.body?.status ? String(req.body.status) : 'Present',
            markedBy: req.user?.name || req.user?.email || 'admin',
        });
        return res.json(record);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

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
router.get('/qr-attendance', authenticate, async (req, res) => {
    try {
        const campusId = toInt(req.user?.campusId);
        if (!campusId) return res.status(400).json({ message: 'campusId is required' });

        const role = req.user?.role;
        const attendanceType = normalizeAttendanceType(req.query?.attendanceType) || undefined;
        const where = { campusId };
        if (attendanceType) where.attendanceType = attendanceType;

        // Self-only for students/teachers
        if (role === 'student' || role === 'teacher') {
            const self = await getSelfPerson({ role, userId: req.user.id, campusId });
            if (!self) return res.json([]);
            where.attendanceType = self.attendanceType;
            where.personId = self.personId;
        }

        const { start, end } = (() => {
            const startDate = req.query?.startDate ? new Date(req.query.startDate) : null;
            const endDate = req.query?.endDate ? new Date(req.query.endDate) : null;
            if (startDate && endDate && !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
                return { start: startDate, end: endDate };
            }
            if (req.query?.date) {
                const d = new Date(req.query.date);
                if (!Number.isNaN(d.getTime())) {
                    const s = new Date(d); s.setHours(0, 0, 0, 0);
                    const e = new Date(d); e.setHours(23, 59, 59, 999);
                    return { start: s, end: e };
                }
            }
            return todayRange();
        })();
        where.date = { [Op.between]: [start, end] };

        const items = await QRAttendance.findAll({ where, order: [['date', 'DESC'], ['createdAt', 'DESC']] });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a short-lived session QR (shown on a screen at the gate/class).
router.post('/qr-attendance-sessions', authenticate, authorize('admin', 'owner', 'teacher'), async (req, res) => {
    try {
        const campusId = toInt(req.user?.campusId);
        if (!campusId) return res.status(400).json({ message: 'campusId is required' });

        const attendanceType = normalizeAttendanceType(req.body?.attendanceType);
        if (!attendanceType) return res.status(400).json({ message: 'attendanceType is required' });

        const expiresInMinutes = Math.max(1, Math.min(60, Number(req.body?.expiresInMinutes) || 3));
        const token = crypto.randomBytes(16).toString('hex');
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

        const created = await QRAttendanceSession.create({
            token,
            attendanceType,
            campusId,
            createdBy: req.user?.id || null,
            expiresAt,
        });

        const qrPayload = JSON.stringify({
            kind: 'qr-attendance-session',
            token,
            attendanceType,
            campusId,
            exp: expiresAt.toISOString(),
        });

        res.status(201).json({
            id: created.id,
            token,
            attendanceType,
            campusId,
            expiresAt,
            qrPayload,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Student/Teacher scan the session QR to mark themselves present.
router.post('/qr-attendance/scan', authenticate, async (req, res) => {
    return scanSessionHandler(req, res);
});

// Admin/Owner marks a person by scanning their ID QR (which contains the personId).
router.post('/qr-attendance/mark-person', authenticate, authorize('admin', 'owner', 'superadmin'), async (req, res) => {
    return markPersonHandler(req, res);
});

// Backward-compatible create endpoint:
// - student/teacher: treat qrCode as session token and mark self
// - admin: treat as mark-person payload
router.post('/qr-attendance', authenticate, async (req, res) => {
    try {
        if (req.user?.role === 'student' || req.user?.role === 'teacher') {
            req.body = { token: req.body?.token || req.body?.qrCode };
            return scanSessionHandler(req, res);
        }
        if (req.user?.role === 'admin' || req.user?.role === 'owner' || req.user?.role === 'superadmin') {
            return markPersonHandler(req, res);
        }
        return res.status(403).json({ message: 'Forbidden' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;
