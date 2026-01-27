import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controller from '../controllers/sharedContent.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
  '/',
  authenticate,
  [
    query('type').optional().isString(),
    query('status').optional().isString(),
    query('subjectId').optional().isInt(),
    query('className').optional().isString(),
    query('section').optional().isString(),
    query('q').optional().isString(),
  ],
  validate,
  controller.list
);

router.get('/:id', authenticate, [param('id').isInt()], validate, controller.getById);

router.post(
  '/',
  authenticate,
  authorize('teacher'),
  [
    body('type').isIn(['note', 'pdf', 'video', 'resource']),
    body('title').isString().trim().notEmpty(),
    body('description').optional({ nullable: true }).isString(),
    body('url').optional({ nullable: true }).isString(),
    body('subjectId').isInt(),
    body('className').isString().trim().notEmpty(),
    body('section').optional({ nullable: true }).isString(),
    body('status').optional().isIn(['draft', 'published']),
  ],
  validate,
  controller.create
);

router.put(
  '/:id',
  authenticate,
  authorize('teacher'),
  [
    param('id').isInt(),
    body('type').optional().isIn(['note', 'pdf', 'video', 'resource']),
    body('title').optional().isString().trim(),
    body('description').optional({ nullable: true }).isString(),
    body('url').optional({ nullable: true }).isString(),
    body('subjectId').optional().isInt(),
    body('className').optional().isString().trim(),
    body('section').optional({ nullable: true }).isString(),
    body('status').optional().isIn(['draft', 'published']),
  ],
  validate,
  controller.update
);

router.put('/:id/publish', authenticate, authorize('teacher'), [param('id').isInt()], validate, controller.publish);
router.put('/:id/unpublish', authenticate, authorize('teacher'), [param('id').isInt()], validate, controller.unpublish);
router.delete('/:id', authenticate, authorize('teacher'), [param('id').isInt()], validate, controller.remove);

export default router;
