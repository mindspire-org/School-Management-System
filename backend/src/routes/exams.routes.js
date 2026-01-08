import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controller from '../controllers/exams.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
  '/',
  authenticate,
  [
    query('q').optional().isString(),
    query('className').optional().isString(),
    query('section').optional().isString(),
    query('fromDate').optional().isISO8601(),
    query('toDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  controller.list
);

router.get('/:id', authenticate, [param('id').isInt()], validate, controller.getById);

router.post(
  '/',
  authenticate,
  authorize('admin', 'teacher', 'owner'),
  [
    body('title').isString().notEmpty(),
    body('examDate').optional().isISO8601(),
    body('className').optional().isString(),
    body('section').optional().isString(),
  ],
  validate,
  controller.create
);

router.put('/:id', authenticate, authorize('admin', 'teacher', 'owner'), [param('id').isInt()], validate, controller.update);
router.delete('/:id', authenticate, authorize('admin', 'owner'), [param('id').isInt()], validate, controller.remove);

export default router;
