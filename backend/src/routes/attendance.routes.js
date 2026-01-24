import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controller from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
  '/',
  authenticate,
  [
    query('studentId').optional().isInt(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  controller.list
);

// Daily attendance (admin/teacher) — must be BEFORE '/:id' to avoid being captured by param route
router.get(
  '/daily',
  authenticate,
  authorize('admin', 'teacher', 'owner'),
  [
    query('date').isISO8601({ strict: false }),
    query('class').optional().isString(),
    query('section').optional().isString(),
    query('q').optional().isString(),
  ],
  validate,
  controller.listDaily
);

router.post(
  '/daily',
  authenticate,
  authorize('admin', 'teacher', 'owner'),
  [
    body('date').isISO8601({ strict: false }),
    body('records').isArray({ min: 1 }),
    body('records.*.studentId').customSanitizer((v) => (typeof v === 'number' ? v : parseInt(v, 10))).isInt().toInt(),
    body('records.*.status').isIn(['present', 'absent', 'late']),
    body('records.*.remarks').optional({ nullable: true }).isString(),
  ],
  validate,
  controller.upsertDaily
);

router.get(
  '/:id',
  authenticate,
  [param('id').isInt()],
  validate,
  controller.getById
);

router.post(
  '/',
  authenticate,
  authorize('admin', 'teacher', 'owner'),
  [
    body('studentId').customSanitizer((v) => (typeof v === 'number' ? v : parseInt(v, 10))).isInt().toInt(),
    body('date').isISO8601({ strict: false }),
    body('status').isIn(['present', 'absent', 'late', 'leave']),
    body('remarks').optional({ nullable: true }).isString(),
  ],
  validate,
  controller.create
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'teacher', 'owner'),
  [param('id').isInt()],
  validate,
  controller.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'owner'),
  [param('id').isInt()],
  validate,
  controller.remove
);

export default router;
