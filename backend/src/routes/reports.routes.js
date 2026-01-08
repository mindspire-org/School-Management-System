import { Router } from 'express';
import { query } from 'express-validator';
import * as controller from '../controllers/reports.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/overview', authenticate, authorize('admin', 'owner'), controller.overview);

router.get(
  '/attendance-summary',
  authenticate,
  authorize('admin', 'owner'),
  [
    query('fromDate').optional().isISO8601(),
    query('toDate').optional().isISO8601(),
    query('class').optional().isString(),
    query('section').optional().isString(),
    query('roll').optional().isString(),
  ],
  validate,
  controller.attendanceSummary
);

router.get(
  '/finance-summary',
  authenticate,
  authorize('admin', 'owner'),
  [query('fromDate').optional().isISO8601(), query('toDate').optional().isISO8601()],
  validate,
  controller.financeSummary
);

router.get(
  '/exam-performance',
  authenticate,
  authorize('admin', 'owner'),
  [query('examId').optional().isInt()],
  validate,
  controller.examPerformance
);

router.get(
  '/attendance-by-class',
  authenticate,
  authorize('admin', 'owner'),
  [
    query('fromDate').optional().isISO8601(),
    query('toDate').optional().isISO8601(),
    query('class').optional().isString(),
    query('section').optional().isString(),
    query('roll').optional().isString(),
  ],
  validate,
  controller.attendanceByClass
);

router.get(
  '/attendance-heatmap',
  authenticate,
  authorize('admin', 'owner'),
  [
    query('fromDate').optional().isISO8601(),
    query('toDate').optional().isISO8601(),
    query('class').optional().isString(),
    query('section').optional().isString(),
    query('location').optional().isString(),
  ],
  validate,
  controller.attendanceHeatmap
);

export default router;
