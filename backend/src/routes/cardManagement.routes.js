import { Router } from 'express';
import { IdCardTemplate, GeneratedIdCard, AdmitCardTemplate, GeneratedAdmitCard } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { query } from '../config/db.js';
import cloudinary from '../config/cloudinary.js';

const router = Router();

router.use(authenticate);

const adminRoles = new Set(['admin', 'owner', 'superadmin']);

const resolveCampusId = (req) => {
    const headerCampusId =
        req.headers?.['x-campus-id'] ??
        req.headers?.['x-campusid'] ??
        req.headers?.['campus-id'] ??
        req.headers?.['campusid'];
    const raw = headerCampusId ?? req.query?.campusId ?? req.body?.campusId;
    const requested = raw === '' || raw === undefined || raw === null ? null : raw;
    const role = req.user?.role;
    const authCampusId = req.user?.campusId;

    if (authCampusId && !adminRoles.has(role)) return Number(authCampusId);
    const resolved = requested ?? authCampusId;
    if (resolved === '' || resolved === undefined || resolved === null) return null;
    const n = Number(resolved);
    if (Number.isNaN(n)) return null;
    return n;
};

const stripCreatePayload = (payload) => {
    const p = { ...payload };
    if (p.id === '' || p.id === null || p.id === undefined) delete p.id;
    delete p.id;
    delete p.campusId;
    delete p.campus_id;
    return p;
};

const stripUpdatePayload = (payload) => {
    const p = { ...payload };
    delete p.id;
    delete p.campusId;
    delete p.campus_id;
    return p;
};

const maybeUploadLogoUrl = async (logoUrl, folder) => {
    if (!logoUrl || typeof logoUrl !== 'string') return logoUrl;
    if (!logoUrl.startsWith('data:')) return logoUrl;
    try {
        const upload = await cloudinary.uploader.upload(logoUrl, { folder: folder || 'templates' });
        return upload?.secure_url || logoUrl;
    } catch (_) {
        return logoUrl;
    }
};

const createCRUD = (Model) => ({
    getAll: async (req, res) => {
        try {
            const campusId = resolveCampusId(req);
            const where = campusId ? { campusId } : {};
            if (req.query?.type && Model?.rawAttributes?.type) {
                where.type = String(req.query.type);
            }
            const items = await Model.findAll({ where });
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getOne: async (req, res) => {
        try {
            const campusId = resolveCampusId(req);
            const item = await Model.findByPk(req.params.id);
            if (!item) return res.status(404).json({ error: 'Not found' });
            if (campusId && String(item.campusId) !== String(campusId)) {
                return res.status(404).json({ error: 'Not found' });
            }
            res.json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    create: async (req, res) => {
        try {
            const campusId = resolveCampusId(req);
            if (!campusId) return res.status(400).json({ error: 'campusId is required' });
            const payload = stripCreatePayload(req.body);
            if (Model?.rawAttributes?.logoUrl && payload.logoUrl) {
                const folder = Model === IdCardTemplate ? 'id-card-templates' : Model === AdmitCardTemplate ? 'admit-card-templates' : 'templates';
                payload.logoUrl = await maybeUploadLogoUrl(payload.logoUrl, folder);
            }
            const item = await Model.create({ ...payload, campusId });
            res.status(201).json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const campusId = resolveCampusId(req);
            if (!campusId) return res.status(400).json({ error: 'campusId is required' });
            const item = await Model.findByPk(req.params.id);
            if (!item) return res.status(404).json({ error: 'Not found' });
            if (campusId && String(item.campusId) !== String(campusId)) {
                return res.status(404).json({ error: 'Not found' });
            }
            const payload = stripUpdatePayload(req.body);
            if (Model?.rawAttributes?.logoUrl && payload.logoUrl) {
                const folder = Model === IdCardTemplate ? 'id-card-templates' : Model === AdmitCardTemplate ? 'admit-card-templates' : 'templates';
                payload.logoUrl = await maybeUploadLogoUrl(payload.logoUrl, folder);
            }
            await item.update({ ...payload, campusId });
            res.json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            const campusId = resolveCampusId(req);
            if (!campusId) return res.status(400).json({ error: 'campusId is required' });
            const item = await Model.findByPk(req.params.id);
            if (!item) return res.status(404).json({ error: 'Not found' });
            if (campusId && String(item.campusId) !== String(campusId)) {
                return res.status(404).json({ error: 'Not found' });
            }
            await item.destroy();
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
});

const mapGeneratedIdCardOut = (row) => {
    const json = row?.toJSON ? row.toJSON() : row;
    const type = json?.cardType;
    const mapped = { ...json, type };
    if (type === 'Student') mapped.studentId = json.personId;
    if (type === 'Employee') mapped.employeeId = json.personId;
    return mapped;
};

const mapGeneratedAdmitCardOut = (row) => {
    const json = row?.toJSON ? row.toJSON() : row;
    return { ...json };
};

// ID Card Template routes
const idCardTemplateCRUD = createCRUD(IdCardTemplate);
router.get('/id-card-templates', idCardTemplateCRUD.getAll);
router.get('/id-card-templates/:id', idCardTemplateCRUD.getOne);
router.post('/id-card-templates', idCardTemplateCRUD.create);
router.put('/id-card-templates/:id', idCardTemplateCRUD.update);
router.delete('/id-card-templates/:id', idCardTemplateCRUD.delete);

// Generated ID Card routes
router.get('/generated-id-cards', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        const where = campusId ? { campusId } : {};
        const type = req.query?.type ?? req.query?.cardType;
        if (type) where.cardType = String(type);
        const items = await GeneratedIdCard.findAll({ where });
        res.json(items.map(mapGeneratedIdCardOut));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/generated-id-cards/:id', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        const item = await GeneratedIdCard.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        if (campusId && String(item.campusId) !== String(campusId)) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(mapGeneratedIdCardOut(item));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/generated-id-cards', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        if (!campusId) return res.status(400).json({ error: 'campusId is required' });

        const body = req.body || {};
        const type = body.type ?? body.cardType;
        const personId = body.studentId ?? body.employeeId ?? body.personId;
        if (!type) return res.status(400).json({ error: 'type is required' });
        if (!personId) return res.status(400).json({ error: 'studentId/employeeId is required' });

        let personName = body.personName || body.studentName || body.employeeName;
        if (!personName) {
            try {
                if (String(type) === 'Student') {
                    const { rows } = await query(
                        'SELECT name FROM students WHERE id = $1 AND campus_id = $2 LIMIT 1',
                        [Number(personId), campusId]
                    );
                    if (rows?.[0]?.name) personName = rows[0].name;
                }
                if (String(type) === 'Employee') {
                    const { rows } = await query(
                        'SELECT name FROM teachers WHERE id = $1 AND campus_id = $2 LIMIT 1',
                        [Number(personId), campusId]
                    );
                    if (rows?.[0]?.name) personName = rows[0].name;
                }
            } catch (_) {}
        }

        const payload = stripCreatePayload(body);
        const created = await GeneratedIdCard.create({
            ...payload,
            campusId,
            cardType: String(type),
            personId: Number(personId),
            personName: String(personName || 'Unknown'),
        });
        res.status(201).json(mapGeneratedIdCardOut(created));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/generated-id-cards/:id', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        if (!campusId) return res.status(400).json({ error: 'campusId is required' });
        const item = await GeneratedIdCard.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        if (campusId && String(item.campusId) !== String(campusId)) {
            return res.status(404).json({ error: 'Not found' });
        }
        const payload = stripUpdatePayload(req.body);
        await item.update({ ...payload, campusId });
        res.json(mapGeneratedIdCardOut(item));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/generated-id-cards/:id', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        if (!campusId) return res.status(400).json({ error: 'campusId is required' });
        const item = await GeneratedIdCard.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        if (campusId && String(item.campusId) !== String(campusId)) {
            return res.status(404).json({ error: 'Not found' });
        }
        await item.destroy();
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admit Card Template routes
const admitCardTemplateCRUD = createCRUD(AdmitCardTemplate);
router.get('/admit-card-templates', admitCardTemplateCRUD.getAll);
router.get('/admit-card-templates/:id', admitCardTemplateCRUD.getOne);
router.post('/admit-card-templates', admitCardTemplateCRUD.create);
router.put('/admit-card-templates/:id', admitCardTemplateCRUD.update);
router.delete('/admit-card-templates/:id', admitCardTemplateCRUD.delete);

// Generated Admit Card routes
router.get('/generated-admit-cards', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        const where = campusId ? { campusId } : {};
        const items = await GeneratedAdmitCard.findAll({ where });
        res.json(items.map(mapGeneratedAdmitCardOut));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/generated-admit-cards/:id', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        const item = await GeneratedAdmitCard.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        if (campusId && String(item.campusId) !== String(campusId)) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(mapGeneratedAdmitCardOut(item));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/generated-admit-cards', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        if (!campusId) return res.status(400).json({ error: 'campusId is required' });

        const body = req.body || {};
        const studentId = body.studentId ?? body.student_id;
        const templateId = body.templateId ?? body.template_id;
        if (!studentId) return res.status(400).json({ error: 'studentId is required' });
        if (!templateId) return res.status(400).json({ error: 'templateId is required' });

        let studentName = body.studentName || body.student_name;
        let cls = body.class;
        try {
            const { rows } = await query(
                'SELECT name, class FROM students WHERE id = $1 AND campus_id = $2 LIMIT 1',
                [Number(studentId), campusId]
            );
            if (rows?.[0]?.name) studentName = rows[0].name;
            if (rows?.[0]?.class) cls = rows[0].class;
        } catch (_) {}

        const payload = stripCreatePayload(body);
        const created = await GeneratedAdmitCard.create({
            ...payload,
            campusId,
            studentId: Number(studentId),
            studentName: String(studentName || 'Unknown Student'),
            class: cls || null,
            templateId: Number(templateId),
        });
        res.status(201).json(mapGeneratedAdmitCardOut(created));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/generated-admit-cards/:id', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        if (!campusId) return res.status(400).json({ error: 'campusId is required' });
        const item = await GeneratedAdmitCard.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        if (campusId && String(item.campusId) !== String(campusId)) {
            return res.status(404).json({ error: 'Not found' });
        }

        const payload = stripUpdatePayload(req.body);
        await item.update({ ...payload, campusId });
        res.json(mapGeneratedAdmitCardOut(item));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/generated-admit-cards/:id', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        if (!campusId) return res.status(400).json({ error: 'campusId is required' });
        const item = await GeneratedAdmitCard.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        if (campusId && String(item.campusId) !== String(campusId)) {
            return res.status(404).json({ error: 'Not found' });
        }
        await item.destroy();
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
