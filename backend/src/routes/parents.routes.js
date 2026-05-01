import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as controller from '../controllers/parents.controller.js';

const router = Router();

// Admin management endpoints
router.get('/', authenticate, authorize('admin', 'owner', 'teacher', 'superadmin'), controller.list);
// Place messages route before :id to avoid any ambiguity
router.get('/:id/messages', authenticate, authorize('admin', 'owner', 'superadmin', 'teacher'), controller.listMessages);
router.get('/:id', authenticate, authorize('admin', 'owner', 'teacher', 'superadmin'), controller.getById);
router.post('/', authenticate, authorize('admin', 'owner', 'superadmin'), controller.create);
router.put('/:id', authenticate, authorize('admin', 'owner', 'superadmin'), controller.update);
router.post('/:id/inform', authenticate, authorize('admin', 'owner', 'superadmin'), controller.inform);
router.delete('/:id', authenticate, authorize('admin', 'owner', 'superadmin'), controller.remove);

export default router;
