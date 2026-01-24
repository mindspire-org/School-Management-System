import { Router } from 'express';
import { Product, Category, Store, Supplier, Unit, Purchase, Sale, Issue } from '../models/index.js';

const router = Router();

// Generic CRUD operations
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

// Product routes
const productCRUD = createCRUD(Product);
router.get('/products', productCRUD.getAll);
router.get('/products/:id', productCRUD.getOne);
router.post('/products', productCRUD.create);
router.put('/products/:id', productCRUD.update);
router.delete('/products/:id', productCRUD.delete);

// Category routes
const categoryCRUD = createCRUD(Category);
router.get('/categories', categoryCRUD.getAll);
router.get('/categories/:id', categoryCRUD.getOne);
router.post('/categories', categoryCRUD.create);
router.put('/categories/:id', categoryCRUD.update);
router.delete('/categories/:id', categoryCRUD.delete);

// Store routes
const storeCRUD = createCRUD(Store);
router.get('/stores', storeCRUD.getAll);
router.get('/stores/:id', storeCRUD.getOne);
router.post('/stores', storeCRUD.create);
router.put('/stores/:id', storeCRUD.update);
router.delete('/stores/:id', storeCRUD.delete);

// Supplier routes
const supplierCRUD = createCRUD(Supplier);
router.get('/suppliers', supplierCRUD.getAll);
router.get('/suppliers/:id', supplierCRUD.getOne);
router.post('/suppliers', supplierCRUD.create);
router.put('/suppliers/:id', supplierCRUD.update);
router.delete('/suppliers/:id', supplierCRUD.delete);

// Unit routes
const unitCRUD = createCRUD(Unit);
router.get('/units', unitCRUD.getAll);
router.get('/units/:id', unitCRUD.getOne);
router.post('/units', unitCRUD.create);
router.put('/units/:id', unitCRUD.update);
router.delete('/units/:id', unitCRUD.delete);

// Purchase routes
const purchaseCRUD = createCRUD(Purchase);
router.get('/purchases', purchaseCRUD.getAll);
router.get('/purchases/:id', purchaseCRUD.getOne);
router.post('/purchases', purchaseCRUD.create);
router.put('/purchases/:id', purchaseCRUD.update);
router.delete('/purchases/:id', purchaseCRUD.delete);

// Sale routes
const saleCRUD = createCRUD(Sale);
router.get('/sales', saleCRUD.getAll);
router.get('/sales/:id', saleCRUD.getOne);
router.post('/sales', saleCRUD.create);
router.put('/sales/:id', saleCRUD.update);
router.delete('/sales/:id', saleCRUD.delete);

// Issue routes
const issueCRUD = createCRUD(Issue);
router.get('/issues', issueCRUD.getAll);
router.get('/issues/:id', issueCRUD.getOne);
router.post('/issues', issueCRUD.create);
router.put('/issues/:id', issueCRUD.update);
router.delete('/issues/:id', issueCRUD.delete);

export default router;
