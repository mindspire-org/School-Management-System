import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as controller from '../controllers/parents.controller.js';

const router = Router();

// Admin management endpoints
router.get('/', authenticate, authorize('admin', 'owner', 'teacher'), controller.list);
router.get('/:id', authenticate, authorize('admin', 'owner', 'teacher'), controller.getById);
router.post('/', authenticate, authorize('admin', 'owner'), controller.create);
router.put('/:id', authenticate, authorize('admin', 'owner'), controller.update);
router.post('/:id/inform', authenticate, authorize('admin', 'owner'), controller.inform);
router.delete('/:id', authenticate, authorize('admin', 'owner'), controller.remove);

export default router;
