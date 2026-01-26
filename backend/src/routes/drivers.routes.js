import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controller from '../controllers/drivers.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// List drivers
router.get(
    '/',
    authenticate,
    [
        query('status').optional().isIn(['active', 'inactive', 'on_leave']),
        query('busId').optional().isInt(),
        query('page').optional().isInt({ min: 1 }),
        query('pageSize').optional().isInt({ min: 1, max: 100 }),
    ],
    validate,
    controller.listDrivers
);

// Get driver count
router.get('/count', authenticate, controller.countDrivers);

// Get driver by ID
router.get(
    '/:id',
    authenticate,
    [param('id').isInt()],
    validate,
    controller.getDriverById
);

// Get driver dashboard stats
router.get(
    '/:id/dashboard-stats',
    authenticate,
    [param('id').isInt()],
    validate,
    controller.getDashboardStats
);

// Create driver
router.post(
    '/',
    authenticate,
    authorize('admin', 'owner'),
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').optional().isEmail(),
        body('phone').optional().isString(),
        body('licenseNumber').optional().isString(),
        body('licenseExpiry').optional().isISO8601(),
        body('nationalId').optional().isString(),
        body('address').optional().isString(),
        body('busId').optional().isInt(),
        body('baseSalary').optional().isFloat({ min: 0 }),
        body('allowances').optional().isFloat({ min: 0 }),
        body('deductions').optional().isFloat({ min: 0 }),
        body('paymentMethod').optional().isIn(['bank', 'cash', 'cheque', 'other']),
        body('bankName').optional().isString(),
        body('accountNumber').optional().isString(),
        body('status').optional().isIn(['active', 'inactive', 'on_leave']),
        body('joiningDate').optional().isISO8601(),
    ],
    validate,
    controller.createDriver
);

// Update driver
router.put(
    '/:id',
    authenticate,
    authorize('admin', 'owner'),
    [
        param('id').isInt(),
        body('name').optional().isString(),
        body('email').optional().isEmail(),
        body('phone').optional().isString(),
        body('licenseNumber').optional().isString(),
        body('licenseExpiry').optional().isISO8601(),
        body('nationalId').optional().isString(),
        body('address').optional().isString(),
        body('busId').optional().isInt(),
        body('baseSalary').optional().isFloat({ min: 0 }),
        body('allowances').optional().isFloat({ min: 0 }),
        body('deductions').optional().isFloat({ min: 0 }),
        body('paymentMethod').optional().isIn(['bank', 'cash', 'cheque', 'other']),
        body('bankName').optional().isString(),
        body('accountNumber').optional().isString(),
        body('status').optional().isIn(['active', 'inactive', 'on_leave']),
        body('joiningDate').optional().isISO8601(),
    ],
    validate,
    controller.updateDriver
);

// Delete driver (with financial records warning)
router.delete(
    '/:id',
    authenticate,
    authorize('admin', 'owner'),
    [
        param('id').isInt(),
        query('force').optional().isIn(['true', 'false']),
    ],
    validate,
    controller.deleteDriver
);

// Get driver payroll
router.get(
    '/:id/payroll',
    authenticate,
    [
        param('id').isInt(),
        query('page').optional().isInt({ min: 1 }),
        query('pageSize').optional().isInt({ min: 1, max: 100 }),
    ],
    validate,
    controller.getDriverPayroll
);

// Create/update driver payroll
router.post(
    '/:id/payroll',
    authenticate,
    authorize('admin', 'owner'),
    [
        param('id').isInt(),
        body('periodMonth').isISO8601().withMessage('Period month is required'),
        body('baseSalary').isFloat({ min: 0 }),
        body('allowances').optional().isFloat({ min: 0 }),
        body('deductions').optional().isFloat({ min: 0 }),
        body('bonuses').optional().isFloat({ min: 0 }),
        body('status').optional().isIn(['pending', 'processing', 'paid', 'failed', 'cancelled']),
        body('paymentMethod').optional().isIn(['bank', 'cash', 'cheque', 'other']),
        body('bankName').optional().isString(),
        body('accountTitle').optional().isString(),
        body('accountNumber').optional().isString(),
        body('iban').optional().isString(),
        body('chequeNumber').optional().isString(),
        body('transactionReference').optional().isString(),
        body('paidOn').optional().isISO8601(),
        body('notes').optional().isString(),
    ],
    validate,
    controller.createDriverPayroll
);

// Update payroll status
router.patch(
    '/:id/payroll/:payrollId/status',
    authenticate,
    authorize('admin', 'owner'),
    [
        param('id').isInt(),
        param('payrollId').isInt(),
        body('status').isIn(['pending', 'processing', 'paid', 'failed', 'cancelled']),
        body('transactionReference').optional().isString(),
    ],
    validate,
    controller.updatePayrollStatus
);

router.delete(
    '/:id/payroll/:payrollId',
    authenticate,
    authorize('admin', 'owner'),
    [
        param('id').isInt(),
        param('payrollId').isInt(),
    ],
    validate,
    controller.deleteDriverPayroll
);

export default router;
