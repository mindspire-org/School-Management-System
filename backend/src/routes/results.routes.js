import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controller from '../controllers/results.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
  '/',
  authenticate,
  [
    query('examId').optional().isInt(),
    query('studentId').optional().isInt(),
    query('subject').optional().isString(),
    query('className').optional().isString(),
    query('section').optional().isString(),
    query('q').optional().isString(),
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
  [body('examId').isInt(), body('studentId').isInt(), body('subject').isString().notEmpty(), body('marks').optional().isFloat(), body('grade').optional().isString()],
  validate,
  controller.create
);

router.put('/:id', authenticate, authorize('admin', 'teacher', 'owner'), [param('id').isInt()], validate, controller.update);
router.delete('/:id', authenticate, authorize('admin', 'owner'), [param('id').isInt()], validate, controller.remove);

router.post(
  '/bulk',
  authenticate,
  authorize('admin', 'teacher', 'owner'),
  // Minimal validation: expect an array; detailed validation can be added later
  validate,
  controller.bulkCreate
);

export default router;
