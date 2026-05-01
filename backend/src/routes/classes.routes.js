import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as classController from '../controllers/classes.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const statusValues = ['active', 'inactive', 'archived'];

router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
    query('search').optional().isString(),
    query('className').optional().isString(),
    query('section').optional().isString(),
    query('academicYear').optional().isString(),
    query('status').optional().isIn(statusValues),
    query('teacherId').optional().isInt({ min: 1 }),
  ],
  validate,
  classController.list
);

router.get(
  '/:id',
  authenticate,
  [param('id').isInt()],
  validate,
  classController.getById
);

router.post(
  '/',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    body('className').isString().notEmpty(),
    body('section').isString().notEmpty(),
    body('academicYear').optional().isString(),
    body('isShared').optional().isBoolean(),
    body('classTeacherId').optional().isInt({ min: 1 }),
    body('capacity').optional().isInt({ min: 1 }),
    body('enrolledStudents').optional().isInt({ min: 0 }),
    body('strength').optional().isInt({ min: 0 }),
    body('room').optional().isString(),
    body('medium').optional().isString(),
    body('shift').optional().isString(),
    body('status').optional().isIn(statusValues),
    body('notes').optional().isString(),
  ],
  validate,
  classController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    param('id').isInt(),
    body('className').optional().isString().notEmpty(),
    body('section').optional().isString().notEmpty(),
    body('academicYear').optional().isString(),
    body('isShared').optional().isBoolean(),
    body('classTeacherId').optional().isInt({ min: 1 }),
    body('capacity').optional().isInt({ min: 1 }),
    body('enrolledStudents').optional().isInt({ min: 0 }),
    body('strength').optional().isInt({ min: 0 }),
    body('room').optional().isString(),
    body('medium').optional().isString(),
    body('shift').optional().isString(),
    body('status').optional().isIn(statusValues),
    body('notes').optional().isString(),
  ],
  validate,
  classController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [param('id').isInt()],
  validate,
  classController.remove
);

// Class subjects management
router.get('/:id/subjects', authenticate, [param('id').isInt()], validate, classController.getSubjects);
router.post(
  '/:id/subjects',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [param('id').isInt()],
  validate,
  classController.upsertSubjects
);
router.get(
  '/subjects/by-class',
  authenticate,
  [query('className').optional().isString(), query('section').optional().isString()],
  validate,
  classController.listSubjectsByClassSection
);

export default router;
