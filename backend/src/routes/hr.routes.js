import { Router } from 'express';
import { Payroll, AdvanceSalary, Leave, Award } from '../models/index.js';

const router = Router();

// Generic CRUD helper
const createCRUD = (Model) => ({
    list: async (req, res) => {
        try {
            const { campusId } = req.query;
            const where = campusId ? { campusId } : {};
            const items = await Model.findAll({ where });
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    get: async (req, res) => {
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

// Payroll routes
const payrollCRUD = createCRUD(Payroll);
router.get('/payroll', payrollCRUD.list);
router.get('/payroll/:id', payrollCRUD.get);
router.post('/payroll', payrollCRUD.create);
router.put('/payroll/:id', payrollCRUD.update);
router.delete('/payroll/:id', payrollCRUD.delete);

router.post('/payroll/generate', async (req, res) => {
    const { month, year, campusId } = req.body;
    // TODO: Implement logic to bulk generate payroll for all active employees
    // For now, we'll return a success message
    res.json({ message: 'Payroll generation started', month, year });
});

router.get('/payroll/:id/slip', async (req, res) => {
    try {
        const item = await Payroll.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        // In a real app, generate PDF or return structured data for slip
        res.json({ ...item.toJSON(), slipUrl: `/generated/slips/${item.id}.pdf` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Advance Salary routes
const advanceSalaryCRUD = createCRUD(AdvanceSalary);
router.get('/advance-salary', advanceSalaryCRUD.list);
router.get('/advance-salary/:id', advanceSalaryCRUD.get);
router.post('/advance-salary', advanceSalaryCRUD.create);
router.put('/advance-salary/:id', advanceSalaryCRUD.update);
router.delete('/advance-salary/:id', advanceSalaryCRUD.delete);

router.post('/advance-salary/:id/approve', async (req, res) => {
    try {
        const [updated] = await AdvanceSalary.update({ status: 'Approved', approvedBy: req.body.approvedBy }, { where: { id: req.params.id } });
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Approved' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/advance-salary/:id/reject', async (req, res) => {
    try {
        const [updated] = await AdvanceSalary.update({ status: 'Rejected', rejectionReason: req.body.reason }, { where: { id: req.params.id } });
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Rejected' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Leave routes
const leaveCRUD = createCRUD(Leave);
router.get('/leave', leaveCRUD.list);
router.get('/leave/:id', leaveCRUD.get);
router.post('/leave', leaveCRUD.create);
router.put('/leave/:id', leaveCRUD.update);
router.delete('/leave/:id', leaveCRUD.delete);

router.post('/leave/:id/approve', async (req, res) => {
    try {
        const [updated] = await Leave.update({ status: 'Approved', approvedBy: req.body.approvedBy }, { where: { id: req.params.id } });
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Approved' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/leave/:id/reject', async (req, res) => {
    try {
        const [updated] = await Leave.update({ status: 'Rejected', rejectionReason: req.body.reason }, { where: { id: req.params.id } });
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Rejected' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/leave/balance/:employeeId', async (req, res) => {
    // In real implementation, calculate from Leave table
    res.json({ casual: 10, sick: 7, annual: 15 });
});

// Award routes
const awardCRUD = createCRUD(Award);
router.get('/awards', awardCRUD.list);
router.get('/awards/:id', awardCRUD.get);
router.post('/awards', awardCRUD.create);
router.put('/awards/:id', awardCRUD.update);
router.delete('/awards/:id', awardCRUD.delete);

export default router;
