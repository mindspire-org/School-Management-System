import express from 'express';
import * as campusCtrl from '../controllers/campuses.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes for authenticated users (to resolve campus names)
router.get('/', authenticate, campusCtrl.list);
router.get('/:id', authenticate, campusCtrl.getById);

// Only owner or superadmin can manage campuses
router.use(authenticate, authorize('owner', 'superadmin'));

router.post('/', campusCtrl.create);
router.put('/:id', campusCtrl.update);
router.delete('/:id', campusCtrl.remove);

export default router;
