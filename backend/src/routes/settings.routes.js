import { Router } from 'express';
import { body, param } from 'express-validator';
import * as controller from '../controllers/settings.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', authenticate, authorize('admin','owner'), controller.list);
router.get('/:key', authenticate, authorize('admin','owner','superadmin'), [param('key').isString()], validate, controller.getByKey);
router.put('/:key', authenticate, authorize('admin','owner','superadmin'), [param('key').isString(), body('value').exists()], validate, controller.setKey);
router.delete('/:key', authenticate, authorize('admin','owner','superadmin'), [param('key').isString()], validate, controller.removeKey);

export default router;
