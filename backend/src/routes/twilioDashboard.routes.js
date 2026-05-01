import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as controller from '../controllers/twilioDashboard.controller.js';

const router = Router();

const auth = [authenticate, authorize('admin', 'owner', 'superadmin')];

router.get('/account', ...auth, controller.getAccount);
router.get('/messages', ...auth, controller.getMessages);
router.get('/numbers', ...auth, controller.getNumbers);
router.post('/test-send', ...auth, controller.testSend);

export default router;
