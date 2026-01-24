import { Router } from 'express';
import { overview, attendanceWeekly, feesMonthly } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/overview', authenticate, authorize('admin', 'owner'), overview);
router.get('/attendance-weekly', authenticate, authorize('admin', 'owner'), attendanceWeekly);
router.get('/fees-monthly', authenticate, authorize('admin', 'owner'), feesMonthly);

export default router;
