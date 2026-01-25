import { Router } from 'express';
import { sequelize, Product, Category, Store, Supplier, Unit, Purchase, Sale, Issue } from '../models/index.js';
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
    const raw = headerCampusId ?? req.query?.campusId ?? req.body?.campusId;
    const requested = raw === '' || raw === undefined || raw === null ? null : raw;
    const role = req.user?.role;
    const authCampusId = req.user?.campusId;

    if (authCampusId && !adminRoles.has(role)) return authCampusId;
    const resolved = requested ?? authCampusId;
    if (resolved === '' || resolved === undefined || resolved === null) return null;
    const n = Number(resolved);
    if (Number.isNaN(n)) return null;
    return n;
};

// Generic CRUD operations
const createCRUD = (Model) => ({
    getAll: async (req, res) => {
        try {
            const campusId = resolveCampusId(req);
            const where = campusId ? { campusId } : {};
            const items = await Model.findAll({ where });

            if (Model === Category && campusId) {
                const categories = items.map((c) => c.toJSON());
                const counts = await Promise.all(
                    categories.map(async (c) => {
                        const productCount = await Product.count({ where: { campusId, category: c.name } });
                        return { ...c, productCount };
                    })
                );
                return res.json(counts);
            }

            return res.json(items);
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
            if (payload.campusId === '' || payload.campusId === null || payload.campusId === undefined) delete payload.campusId;
            if (payload.campus_id === '' || payload.campus_id === null || payload.campus_id === undefined) delete payload.campus_id;

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

            const payload = { ...req.body };
            delete payload.id;
            delete payload.campusId;
            delete payload.campus_id;

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
            if (campusId && String(item.campusId) !== String(campusId)) {
                return res.status(404).json({ error: 'Not found' });
            }

            await item.destroy();
            return res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
});

const coerceNumber = (v) => {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
};

const applyStockDelta = async (productId, delta, campusId, t) => {
    if (!productId || !delta) return;
    const productPk = coerceNumber(productId) ?? productId;
    const product = await Product.findByPk(productPk, { transaction: t });
    if (!product) {
        const err = new Error('Product not found');
        err.status = 400;
        throw err;
    }
    if (campusId && String(product.campusId) !== String(campusId)) {
        const err = new Error('Product campus mismatch');
        err.status = 400;
        throw err;
    }
    const currentQty = Number(product.quantity || 0);
    const nextQty = currentQty + Number(delta);
    if (nextQty < 0) {
        const err = new Error('Insufficient stock');
        err.status = 400;
        throw err;
    }
    await product.update({ quantity: nextQty }, { transaction: t });
};

const purchaseEffect = (p) => (p?.status === 'Completed' ? Number(p?.quantity || 0) : 0);
const saleEffect = (s) => (s?.status === 'Paid' ? -Number(s?.quantity || 0) : 0);
const issueEffect = (i) => (i?.status === 'Issued' ? -Number(i?.quantity || 0) : 0);

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
router.post('/purchases', async (req, res) => {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const body = { ...req.body, ...(campusId ? { campusId } : {}) };
    const t = await sequelize.transaction();
    try {
        const created = await Purchase.create(body, { transaction: t });
        await applyStockDelta(created.productId, purchaseEffect(created), campusId, t);
        await t.commit();
        return res.status(201).json(created);
    } catch (error) {
        await t.rollback();
        return res.status(error.status || 500).json({ error: error.message });
    }
});
router.put('/purchases/:id', async (req, res) => {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const t = await sequelize.transaction();
    try {
        const existing = await Purchase.findByPk(req.params.id, { transaction: t });
        if (!existing) {
            await t.rollback();
            return res.status(404).json({ error: 'Not found' });
        }

        await applyStockDelta(existing.productId, -purchaseEffect(existing), campusId, t);
        await existing.update({ ...req.body, ...(campusId ? { campusId } : {}) }, { transaction: t });
        await applyStockDelta(existing.productId, purchaseEffect(existing), campusId, t);

        await t.commit();
        return res.json(existing);
    } catch (error) {
        await t.rollback();
        return res.status(error.status || 500).json({ error: error.message });
    }
});
router.delete('/purchases/:id', async (req, res) => {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const t = await sequelize.transaction();
    try {
        const existing = await Purchase.findByPk(req.params.id, { transaction: t });
        if (!existing) {
            await t.rollback();
            return res.status(404).json({ error: 'Not found' });
        }
        await applyStockDelta(existing.productId, -purchaseEffect(existing), campusId, t);
        await existing.destroy({ transaction: t });
        await t.commit();
        return res.json({ message: 'Deleted successfully' });
    } catch (error) {
        await t.rollback();
        return res.status(error.status || 500).json({ error: error.message });
    }
});

// Sale routes
const saleCRUD = createCRUD(Sale);
router.get('/sales', saleCRUD.getAll);
router.get('/sales/:id', saleCRUD.getOne);
router.post('/sales', async (req, res) => {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const body = { ...req.body, ...(campusId ? { campusId } : {}) };
    const t = await sequelize.transaction();
    try {
        const created = await Sale.create(body, { transaction: t });
        await applyStockDelta(created.productId, saleEffect(created), campusId, t);
        await t.commit();
        return res.status(201).json(created);
    } catch (error) {
        await t.rollback();
        return res.status(error.status || 500).json({ error: error.message });
    }
});
router.put('/sales/:id', async (req, res) => {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const t = await sequelize.transaction();
    try {
        const existing = await Sale.findByPk(req.params.id, { transaction: t });
        if (!existing) {
            await t.rollback();
            return res.status(404).json({ error: 'Not found' });
        }

        await applyStockDelta(existing.productId, -saleEffect(existing), campusId, t);
        await existing.update({ ...req.body, ...(campusId ? { campusId } : {}) }, { transaction: t });
        await applyStockDelta(existing.productId, saleEffect(existing), campusId, t);

        await t.commit();
        return res.json(existing);
    } catch (error) {
        await t.rollback();
        return res.status(error.status || 500).json({ error: error.message });
    }
});
router.delete('/sales/:id', async (req, res) => {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const t = await sequelize.transaction();
    try {
        const existing = await Sale.findByPk(req.params.id, { transaction: t });
        if (!existing) {
            await t.rollback();
            return res.status(404).json({ error: 'Not found' });
        }
        await applyStockDelta(existing.productId, -saleEffect(existing), campusId, t);
        await existing.destroy({ transaction: t });
        await t.commit();
        return res.json({ message: 'Deleted successfully' });
    } catch (error) {
        await t.rollback();
        return res.status(error.status || 500).json({ error: error.message });
    }
});

// Issue routes
const issueCRUD = createCRUD(Issue);
router.get('/issues', issueCRUD.getAll);
router.get('/issues/:id', issueCRUD.getOne);
router.post('/issues', async (req, res) => {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const body = { ...req.body, ...(campusId ? { campusId } : {}) };
    const t = await sequelize.transaction();
    try {
        const created = await Issue.create(body, { transaction: t });
        await applyStockDelta(created.productId, issueEffect(created), campusId, t);
        await t.commit();
        return res.status(201).json(created);
    } catch (error) {
        await t.rollback();
        return res.status(error.status || 500).json({ error: error.message });
    }
});
router.put('/issues/:id', async (req, res) => {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const t = await sequelize.transaction();
    try {
        const existing = await Issue.findByPk(req.params.id, { transaction: t });
        if (!existing) {
            await t.rollback();
            return res.status(404).json({ error: 'Not found' });
        }

        await applyStockDelta(existing.productId, -issueEffect(existing), campusId, t);
        await existing.update({ ...req.body, ...(campusId ? { campusId } : {}) }, { transaction: t });
        await applyStockDelta(existing.productId, issueEffect(existing), campusId, t);

        await t.commit();
        return res.json(existing);
    } catch (error) {
        await t.rollback();
        return res.status(error.status || 500).json({ error: error.message });
    }
});
router.delete('/issues/:id', async (req, res) => {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const t = await sequelize.transaction();
    try {
        const existing = await Issue.findByPk(req.params.id, { transaction: t });
        if (!existing) {
            await t.rollback();
            return res.status(404).json({ error: 'Not found' });
        }
        await applyStockDelta(existing.productId, -issueEffect(existing), campusId, t);
        await existing.destroy({ transaction: t });
        await t.commit();
        return res.json({ message: 'Deleted successfully' });
    } catch (error) {
        await t.rollback();
        return res.status(error.status || 500).json({ error: error.message });
    }
});

export default router;
