import { Router } from 'express';
import { IdCardTemplate, GeneratedIdCard, AdmitCardTemplate, GeneratedAdmitCard } from '../models/index.js';

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

// ID Card Template routes
const idCardTemplateCRUD = createCRUD(IdCardTemplate);
router.get('/id-card-templates', idCardTemplateCRUD.getAll);
router.get('/id-card-templates/:id', idCardTemplateCRUD.getOne);
router.post('/id-card-templates', idCardTemplateCRUD.create);
router.put('/id-card-templates/:id', idCardTemplateCRUD.update);
router.delete('/id-card-templates/:id', idCardTemplateCRUD.delete);

// Generated ID Card routes
const generatedIdCardCRUD = createCRUD(GeneratedIdCard);
router.get('/generated-id-cards', generatedIdCardCRUD.getAll);
router.get('/generated-id-cards/:id', generatedIdCardCRUD.getOne);
router.post('/generated-id-cards', generatedIdCardCRUD.create);
router.put('/generated-id-cards/:id', generatedIdCardCRUD.update);
router.delete('/generated-id-cards/:id', generatedIdCardCRUD.delete);

// Admit Card Template routes
const admitCardTemplateCRUD = createCRUD(AdmitCardTemplate);
router.get('/admit-card-templates', admitCardTemplateCRUD.getAll);
router.get('/admit-card-templates/:id', admitCardTemplateCRUD.getOne);
router.post('/admit-card-templates', admitCardTemplateCRUD.create);
router.put('/admit-card-templates/:id', admitCardTemplateCRUD.update);
router.delete('/admit-card-templates/:id', admitCardTemplateCRUD.delete);

// Generated Admit Card routes
const generatedAdmitCardCRUD = createCRUD(GeneratedAdmitCard);
router.get('/generated-admit-cards', generatedAdmitCardCRUD.getAll);
router.get('/generated-admit-cards/:id', generatedAdmitCardCRUD.getOne);
router.post('/generated-admit-cards', generatedAdmitCardCRUD.create);
router.put('/generated-admit-cards/:id', generatedAdmitCardCRUD.update);
router.delete('/generated-admit-cards/:id', generatedAdmitCardCRUD.delete);

export default router;
