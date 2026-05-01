import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as controller from '../controllers/marks.controller.js';

const router = Router();

router.post(
  '/bulk-upsert',
  authenticate,
  authorize('admin', 'teacher', 'owner', 'superadmin'),
  [
    body('examId').isInt({ min: 1 }),
    body('items').isArray({ min: 1 }),
    body('items.*.studentId').isInt({ min: 1 }),
    body('items.*.subject').isString().trim().notEmpty(),
    body('items.*.marks').optional({ nullable: true }).isFloat({ min: 0 }),
    body('items.*.grade').optional({ nullable: true }).isString(),
  ],
  validate,
  controller.bulkUpsert
);

router.get(
  '/entries',
  authenticate,
  [
    query('examId').isInt({ min: 1 }),
    query('className').isString().trim().notEmpty(),
    query('section').isString().trim().notEmpty(),
    query('subject').isString().trim().notEmpty(),
  ],
  validate,
  controller.listEntries
);

router.get(
  '/result-card',
  authenticate,
  [query('studentId').isInt({ min: 1 }), query('examId').isInt({ min: 1 })],
  validate,
  controller.getResultCard
);

export default router;
