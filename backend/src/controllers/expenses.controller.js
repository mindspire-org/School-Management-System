import * as service from '../services/expenses.service.js';

export const listExpenses = async (req, res, next) => {
    try {
        const result = await service.listExpenses({ ...req.query, campusId: req.user?.campusId });
        res.json(result);
    } catch (e) { next(e); }
};

export const getExpenseStats = async (req, res, next) => {
    try {
        const result = await service.getExpenseStats({ campusId: req.user?.campusId });
        res.json(result);
    } catch (e) { next(e); }
};

export const getExpenseById = async (req, res, next) => {
    try {
        const result = await service.getExpenseById(req.params.id);
        if (!result) return res.status(404).json({ message: 'Expense not found' });
        res.json(result);
    } catch (e) { next(e); }
};

export const createExpense = async (req, res, next) => {
    try {
        const isSuperAdmin = req.user?.role === 'superadmin' || req.user?.role === 'owner';
        // Non-superadmins can only create Pending expenses
        const data = { ...req.body, campusId: req.user?.campusId };
        if (!isSuperAdmin) {
            data.status = 'Pending';
        }
        const result = await service.createExpense(data, req.user?.id);
        res.status(201).json(result);
    } catch (e) { next(e); }
};

export const updateExpense = async (req, res, next) => {
    try {
        const result = await service.updateExpense(req.params.id, req.body);
        if (!result) return res.status(404).json({ message: 'Expense not found' });
        res.json(result);
    } catch (e) { next(e); }
};

export const updateExpenseStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const result = await service.updateExpense(req.params.id, { status });
        if (!result) return res.status(404).json({ message: 'Expense not found' });
        res.json(result);
    } catch (e) { next(e); }
};

export const deleteExpense = async (req, res, next) => {
    try {
        await service.deleteExpense(req.params.id);
        res.json({ success: true });
    } catch (e) { next(e); }
};
