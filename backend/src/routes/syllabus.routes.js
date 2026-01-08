import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as syllabusController from '../controllers/syllabus.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
  '/',
  authenticate,
  [
    query('className').optional().isString().trim(),
    query('class').optional().isString().trim(),
    query('section').optional().isString().trim(),
    query('subject').optional().isString().trim(),
    query('teacherId').optional().isInt({ min: 1 }),
    query('q').optional().isString().trim(),
    query('search').optional().isString().trim(),
  ],
  validate,
  syllabusController.list
);

router.get('/:id', authenticate, [param('id').isInt()], validate, syllabusController.getById);

const optionalStringBody = (field) => body(field).optional({ checkFalsy: true }).isString().trim();

router.post(
  '/',
  authenticate,
  authorize('admin', 'owner'),
  [
    body('className').optional().isString().trim(),
    body('class').optional().isString().trim(),
    optionalStringBody('section'),
    body('subject').isString().trim(),
    body('teacherId').optional().isInt({ min: 1 }),
    body('chapters').optional().isInt({ min: 0 }),
    body('covered').optional().isInt({ min: 0 }),
    optionalStringBody('dueDate'),
    optionalStringBody('notes'),
  ],
  validate,
  syllabusController.create
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'owner'),
  [
    param('id').isInt(),
    body('className').optional().isString().trim(),
    body('class').optional().isString().trim(),
    optionalStringBody('section'),
    optionalStringBody('subject'),
    body('teacherId').optional().isInt({ min: 1 }),
    body('chapters').optional().isInt({ min: 0 }),
    body('covered').optional().isInt({ min: 0 }),
    optionalStringBody('dueDate'),
    optionalStringBody('notes'),
  ],
  validate,
  syllabusController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'owner'),
  [param('id').isInt()],
  validate,
  syllabusController.remove
);

export default router;
