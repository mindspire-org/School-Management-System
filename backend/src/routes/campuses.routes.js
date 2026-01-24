import express from 'express';
import * as campusCtrl from '../controllers/campuses.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Only owner or admin can manage campuses
router.use(authenticate);
router.use(authorize('owner', 'admin', 'superadmin'));

router.get('/', campusCtrl.list);
router.get('/:id', campusCtrl.getById);
router.post('/', campusCtrl.create);
router.put('/:id', campusCtrl.update);
router.delete('/:id', campusCtrl.remove);

export default router;
