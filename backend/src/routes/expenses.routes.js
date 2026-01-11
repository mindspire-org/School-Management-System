import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controller from '../controllers/expenses.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
    '/',
    authenticate,
    [
        query('page').optional().isInt({ min: 1 }),
        query('pageSize').optional().isInt({ min: 1, max: 200 }),
    ],
    validate,
    controller.listExpenses
);

router.get('/stats', authenticate, controller.getExpenseStats);

router.get('/:id', authenticate, [param('id').isInt()], validate, controller.getExpenseById);

router.post(
    '/',
    authenticate,
    authorize('admin', 'owner'),
    [
        body('date').isISO8601(),
        body('category').isString(),
        body('amount').isFloat({ gt: 0 }),
        body('status').optional().isIn(['Pending', 'Approved', 'Paid', 'Rejected']),
    ],
    validate,
    controller.createExpense
);

router.put(
    '/:id',
    authenticate,
    authorize('admin', 'owner'),
    [
        param('id').isInt(),
        body('amount').optional().isFloat({ gt: 0 }),
    ],
    validate,
    controller.updateExpense
);

router.delete(
    '/:id',
    authenticate,
    authorize('admin', 'owner'),
    [param('id').isInt()],
    validate,
    controller.deleteExpense
);

export default router;
