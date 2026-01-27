import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as studentController from '../controllers/students.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// All student endpoints require auth; admin can create/update/delete
router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
    query('q').optional().isString(),
    query('class').optional().isString(),
    query('section').optional().isString(),
  ],
  validate,
  studentController.list
);

router.get(
  '/:id/attendance-trend',
  authenticate,
  [param('id').isInt()],
  validate,
  studentController.getAttendanceTrend
);

router.get(
  '/:id/dashboard-stats',
  authenticate,
  [param('id').isInt()],
  validate,
  studentController.getDashboardStats
);

router.get(
  '/:id',
  authenticate,
  [param('id').isInt()],
  validate,
  studentController.getById
);

router.post(
  '/',
  authenticate,
  authorize('admin', 'owner'),
  [
    body('name').isString().notEmpty(),
    body('email').optional().isEmail(),
    body('rollNumber').optional().isString(),
    body('class').optional().isString(),
    body('section').optional().isString(),
    body('rfidTag').optional().isString(),
    body('attendance').optional().isFloat({ min: 0, max: 100 }),
    body('feeStatus').optional().isIn(['paid', 'pending', 'overdue']),
    body('busNumber').optional().isString(),
    body('busAssigned').optional().isBoolean(),
    body('parentName').optional().isString(),
    body('parentPhone').optional().isString(),
    body('status').optional().isIn(['active', 'inactive']).default('active'),
    body('admissionDate').optional().isISO8601().toDate(),
  ],
  validate,
  studentController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'owner'),
  [param('id').isInt()],
  validate,
  studentController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'owner'),
  [param('id').isInt()],
  validate,
  studentController.remove
);

// Attendance (per-student)
router.get(
  '/:id/attendance',
  authenticate,
  [
    param('id').isInt(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  studentController.listAttendance
);

router.post(
  '/:id/attendance',
  authenticate,
  authorize('admin', 'owner', 'teacher'),
  [
    param('id').isInt(),
    body('date').isISO8601(),
    body('status').isIn(['present', 'absent', 'late']),
    body('remarks').optional().isString(),
  ],
  validate,
  studentController.addAttendance
);

router.put(
  '/:id/attendance/:attendanceId',
  authenticate,
  authorize('admin', 'owner', 'teacher'),
  [param('id').isInt(), param('attendanceId').isInt()],
  validate,
  studentController.updateAttendance
);

router.delete(
  '/:id/attendance/:attendanceId',
  authenticate,
  authorize('admin', 'owner'),
  [param('id').isInt(), param('attendanceId').isInt()],
  validate,
  studentController.removeAttendance
);

// Performance
router.get(
  '/:id/performance',
  authenticate,
  [param('id').isInt()],
  validate,
  studentController.getPerformance
);

// Fees
router.get(
  '/:id/fees',
  authenticate,
  [param('id').isInt()],
  validate,
  studentController.getFees
);

router.get(
  '/:id/fees/payments',
  authenticate,
  [param('id').isInt()],
  validate,
  studentController.listFeePayments
);

router.post(
  '/:id/fees/invoices',
  authenticate,
  authorize('admin', 'owner'),
  [
    param('id').isInt(),
    body('amount').isFloat({ gt: 0 }),
    body('dueDate').optional().isISO8601(),
    body('status').optional().isIn(['pending', 'in_progress', 'paid', 'overdue']),
  ],
  validate,
  studentController.createInvoice
);

router.put(
  '/:id/fees/invoices/:invoiceId',
  authenticate,
  authorize('admin', 'owner'),
  [
    param('id').isInt(),
    param('invoiceId').isInt(),
    body('amount').optional().isFloat({ gt: 0 }),
    body('dueDate').optional().isISO8601(),
    body('status').optional().isIn(['pending', 'in_progress', 'paid', 'overdue']),
  ],
  validate,
  studentController.updateInvoice
);

router.post(
  '/:id/fees/payments',
  authenticate,
  authorize('admin', 'owner', 'student'),
  [
    param('id').isInt(),
    body('invoiceId').isInt(),
    body('amount').isFloat({ gt: 0 }),
    body('method').optional().isString(),
  ],
  validate,
  studentController.recordPayment
);

// Transport
router.get(
  '/:id/transport',
  authenticate,
  [param('id').isInt()],
  validate,
  studentController.getTransport
);

router.put(
  '/:id/transport',
  authenticate,
  authorize('admin', 'owner'),
  [
    param('id').isInt(),
    body('routeId').optional().isInt({ min: 1 }),
    body('busId').optional().isInt({ min: 1 }),
    body('pickupStopId').optional().isInt({ min: 1 }),
    body('dropStopId').optional().isInt({ min: 1 }),
  ],
  validate,
  studentController.updateTransport
);
router.put(
  '/me/profile',
  authenticate,
  authorize('student'),
  [
    body('name').optional().isString(),
    body('email').optional().isString(),
    body('parentName').optional().isString(),
    body('parentPhone').optional().isString(),
  ],
  validate,
  studentController.updateSelfProfile
);

router.post(
  '/me/change-password',
  authenticate,
  authorize('student'),
  [
    body('currentPassword').isString().notEmpty(),
    body('newPassword').isString().isLength({ min: 6 }),
  ],
  validate,
  studentController.changeMyPassword
);

router.get(
  '/me/subject-teachers',
  authenticate,
  authorize('student'),
  validate,
  studentController.listMySubjectTeachers
);

export default router;
