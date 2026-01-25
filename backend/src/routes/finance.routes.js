import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controller from '../controllers/finance.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ========================================
// USER CHECKS
// ========================================

// Check if any users exist (students, teachers, drivers)
router.get('/check-users', authenticate, authorize('admin', 'owner'), controller.checkUsersExist);

// Get users by type for dropdown
router.get(
  '/users/:type',
  authenticate,
  authorize('admin', 'owner'),
  [param('type').isIn(['student', 'teacher', 'driver'])],
  validate,
  controller.getUsersByType
);

// ========================================
// DASHBOARD
// ========================================

router.get(
  '/dashboard-stats',
  authenticate,
  [query('userType').optional().isIn(['student', 'teacher', 'driver'])],
  validate,
  controller.getDashboardStats
);

router.get(
  '/dashboard-analytics',
  authenticate,
  [
    query('userType').optional().isIn(['student', 'teacher', 'driver']),
    query('days').optional().isInt({ min: 1, max: 60 }),
  ],
  validate,
  controller.getDashboardAnalytics
);

// ========================================
// UNIFIED INVOICES
// ========================================

router.get(
  '/unified-invoices',
  authenticate,
  [
    query('userType').optional().isIn(['student', 'teacher', 'driver']),
    query('userId').optional().isInt(),
    query('status').optional().isIn(['pending', 'partial', 'paid', 'overdue', 'cancelled']),
    query('invoiceType').optional().isIn(['fee', 'salary', 'allowance', 'deduction', 'other']),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  controller.listUnifiedInvoices
);

router.get(
  '/unified-invoices/:id',
  authenticate,
  [param('id').isInt()],
  validate,
  controller.getUnifiedInvoiceById
);

router.post(
  '/unified-invoices',
  authenticate,
  authorize('admin', 'owner'),
  [
    body('userType').isIn(['student', 'teacher', 'driver']).withMessage('User type is required'),
    body('userId').isInt().withMessage('User ID is required'),
    body('invoiceType').isIn(['fee', 'salary', 'allowance', 'deduction', 'other']).withMessage('Invoice type is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('tax').optional().isFloat({ min: 0 }),
    body('discount').optional().isFloat({ min: 0 }),
    body('description').optional().isString(),
    body('dueDate').optional().isISO8601(),
    body('periodMonth').optional().isISO8601(),
  ],
  validate,
  controller.createUnifiedInvoice
);

router.put(
  '/unified-invoices/:id',
  authenticate,
  authorize('admin', 'owner'),
  [
    param('id').isInt(),
    body('amount').optional().isFloat({ gt: 0 }),
    body('tax').optional().isFloat({ min: 0 }),
    body('discount').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['pending', 'partial', 'paid', 'overdue', 'cancelled']),
    body('dueDate').optional().isISO8601(),
    body('description').optional().isString(),
  ],
  validate,
  controller.updateUnifiedInvoice
);

router.delete(
  '/unified-invoices/:id',
  authenticate,
  authorize('admin', 'owner'),
  [param('id').isInt()],
  validate,
  controller.deleteUnifiedInvoice
);

// ========================================
// UNIFIED PAYMENTS
// ========================================

router.get(
  '/unified-payments',
  authenticate,
  [
    query('userType').optional().isIn(['student', 'teacher', 'driver']),
    query('userId').optional().isInt(),
    query('invoiceId').optional().isInt(),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  controller.listUnifiedPayments
);

router.post(
  '/unified-payments',
  authenticate,
  authorize('admin', 'owner'),
  [
    body('invoiceId').isInt().withMessage('Invoice ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('method').optional().isIn(['cash', 'bank', 'online', 'cheque', 'other']),
    body('referenceNumber').optional().isString(),
    body('notes').optional().isString(),
  ],
  validate,
  controller.createUnifiedPayment
);

// ========================================
// RECEIPTS
// ========================================

router.get(
  '/receipts',
  authenticate,
  [
    query('userType').optional().isIn(['student', 'teacher', 'driver']),
    query('userId').optional().isInt(),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  controller.listReceipts
);

router.post(
  '/receipts',
  authenticate,
  authorize('admin', 'owner'),
  [body('paymentId').isInt().withMessage('Payment ID is required')],
  validate,
  controller.createReceipt
);

// ========================================
// OUTSTANDING FEES
// ========================================

router.get(
  '/outstanding',
  authenticate,
  [
    query('userType').optional().isIn(['student', 'teacher', 'driver']),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  controller.getOutstandingFees
);

// ========================================
// PAYROLL
// ========================================

router.get(
  '/payroll',
  authenticate,
  [
    query('role').optional().isIn(['teacher', 'driver']),
    query('periodMonth').optional().isISO8601(),
    query('status').optional().isIn(['pending', 'processing', 'paid', 'failed', 'cancelled']),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  controller.getPayrollSummary
);

// ========================================
// FINANCIAL RECORD CHECK
// ========================================

router.get(
  '/check-records/:userType/:userId',
  authenticate,
  [
    param('userType').isIn(['student', 'teacher', 'driver']),
    param('userId').isInt(),
  ],
  validate,
  controller.checkFinancialRecords
);

// ========================================
// LEGACY ENDPOINTS (Student-only)
// ========================================

router.get(
  '/invoices',
  authenticate,
  [
    query('studentId').optional().isInt(),
    query('status').optional().isIn(['pending', 'paid', 'overdue']),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  controller.listInvoices
);

router.get('/invoices/:id', authenticate, [param('id').isInt()], validate, controller.getInvoiceById);

router.post(
  '/invoices',
  authenticate,
  authorize('admin', 'owner'),
  [body('studentId').isInt(), body('amount').isFloat({ gt: 0 }), body('status').optional().isIn(['pending', 'paid', 'overdue']), body('dueDate').optional().isISO8601()],
  validate,
  controller.createInvoice
);

router.put('/invoices/:id', authenticate, authorize('admin', 'owner'), [param('id').isInt()], validate, controller.updateInvoice);
router.delete('/invoices/:id', authenticate, authorize('admin', 'owner'), [param('id').isInt()], validate, controller.deleteInvoice);

router.get('/invoices/:id/payments', authenticate, [param('id').isInt()], validate, controller.listPayments);
router.post('/invoices/:id/payments', authenticate, authorize('admin', 'owner'), [param('id').isInt(), body('amount').isFloat({ gt: 0 }), body('method').optional().isString()], validate, controller.addPayment);

export default router;
