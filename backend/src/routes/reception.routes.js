import { Router } from 'express';
import { AdmissionEnquiry, PostalRecord, CallLog, VisitorLog, Complaint, ReceptionConfig } from '../models/index.js';

const router = Router();

// Generic CRUD helper
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
