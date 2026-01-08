import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as controller from '../controllers/grading.controller.js';

const router = Router();

router.get('/', authenticate, controller.listSchemes);
router.get('/default', authenticate, controller.getDefaultScheme);
router.get('/:id', authenticate, [param('id').isInt()], validate, controller.getById);

router.post(
  '/',
  authenticate,
  authorize('admin', 'owner'),
  [body('name').optional().isString(), body('academicYear').optional().isString(), body('bands').isObject(), body('isDefault').optional().isBoolean()],
  validate,
  controller.create
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'owner'),
  [param('id').isInt()],
  validate,
  controller.update
);

router.post('/:id/default', authenticate, authorize('admin', 'owner'), [param('id').isInt()], validate, controller.setDefault);

router.post('/compute', authenticate, [body('percentage').optional().isFloat({ min: 0, max: 100 })], validate, controller.compute);

export default router;
