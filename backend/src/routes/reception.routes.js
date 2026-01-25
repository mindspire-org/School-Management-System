import { Router } from 'express';
import { AdmissionEnquiry, PostalRecord, CallLog, VisitorLog, Complaint, ReceptionConfig } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

const adminRoles = new Set(['admin', 'owner', 'superadmin']);

const resolveCampusId = (req) => {
    const headerCampusId =
        req.headers?.['x-campus-id'] ??
        req.headers?.['x-campusid'] ??
        req.headers?.['campus-id'] ??
        req.headers?.['campusid'];
    const requested = headerCampusId ?? req.query?.campusId ?? req.body?.campusId;
    const role = req.user?.role;
    const authCampusId = req.user?.campusId;

    if (authCampusId && !adminRoles.has(role)) return authCampusId;
    return requested ?? authCampusId;
};

// Generic CRUD helper
const createCRUD = (Model) => ({
    getAll: async (req, res) => {
        try {
            const campusId = resolveCampusId(req);
            const where = campusId ? { campusId } : {};
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

            const payload = { ...req.body };
            if (payload.id === '' || payload.id === null || payload.id === undefined) delete payload.id;

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
            if (String(item.campusId) !== String(campusId)) {
                return res.status(404).json({ error: 'Not found' });
            }

            const payload = { ...req.body };
            if (payload.id === '' || payload.id === null || payload.id === undefined) delete payload.id;
            else delete payload.id;

            await item.update({ ...payload, campusId });
            return res.json(item);
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
            if (String(item.campusId) !== String(campusId)) {
                return res.status(404).json({ error: 'Not found' });
            }

            await item.destroy();
            return res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
});

// Admission Enquiry routes
const enquiryCRUD = createCRUD(AdmissionEnquiry);
router.get('/admission-enquiries', enquiryCRUD.getAll);
router.get('/admission-enquiries/:id', enquiryCRUD.getOne);
router.post('/admission-enquiries', enquiryCRUD.create);
router.put('/admission-enquiries/:id', enquiryCRUD.update);
router.delete('/admission-enquiries/:id', enquiryCRUD.delete);

// Postal Record routes
const postalCRUD = createCRUD(PostalRecord);
router.get('/postal-records', postalCRUD.getAll);
router.get('/postal-records/:id', postalCRUD.getOne);
router.post('/postal-records', postalCRUD.create);
router.put('/postal-records/:id', postalCRUD.update);
router.delete('/postal-records/:id', postalCRUD.delete);

// Call Log routes
const callLogCRUD = createCRUD(CallLog);
router.get('/call-logs', callLogCRUD.getAll);
router.get('/call-logs/:id', callLogCRUD.getOne);
router.post('/call-logs', callLogCRUD.create);
router.put('/call-logs/:id', callLogCRUD.update);
router.delete('/call-logs/:id', callLogCRUD.delete);

// Visitor Log routes
const visitorCRUD = createCRUD(VisitorLog);
router.get('/visitor-logs', visitorCRUD.getAll);
router.get('/visitor-logs/:id', visitorCRUD.getOne);
router.post('/visitor-logs', visitorCRUD.create);
router.put('/visitor-logs/:id', visitorCRUD.update);
router.delete('/visitor-logs/:id', visitorCRUD.delete);

// Complaint routes
const complaintCRUD = createCRUD(Complaint);
router.get('/complaints', complaintCRUD.getAll);
router.get('/complaints/:id', complaintCRUD.getOne);
router.post('/complaints', complaintCRUD.create);
router.put('/complaints/:id', complaintCRUD.update);
router.delete('/complaints/:id', complaintCRUD.delete);

// Reception Config routes
const configCRUD = createCRUD(ReceptionConfig);
router.get('/reception-configs', configCRUD.getAll);
router.get('/reception-configs/:id', configCRUD.getOne);
router.post('/reception-configs', configCRUD.create);
router.put('/reception-configs/:id', configCRUD.update);
router.delete('/reception-configs/:id', configCRUD.delete);

export default router;
