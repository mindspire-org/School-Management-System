import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controller from '../controllers/notifications.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
  '/',
  authenticate,
  [
    query('userId').optional().isInt(),
    query('isRead').optional().isBoolean(),
    query('type').optional().isString(),
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
  authorize('admin'),
  [body('message').isString().notEmpty(), body('userId').optional().isInt(), body('type').optional().isString()],
  validate,
  controller.create
);

router.put('/:id/read', authenticate, [param('id').isInt()], validate, controller.markRead);
router.delete('/:id', authenticate, authorize('admin'), [param('id').isInt()], validate, controller.remove);

export default router;
