import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const ownerKeyMin = Number(process.env.OWNER_KEY_MIN_LENGTH || 30);

router.post(
  '/login',
  [
    body().custom((_, { req }) => {
      const uname = String(req.body?.username || '').trim();
      if (uname && uname.length >= 3) return true;
      const v = String(req.body?.email || '').trim();
      const emailRegex = /.+@.+\..+/;
      const phoneRegex = /^\+?\d{10,15}$|^0\d{10}$|^3\d{9}$/;
      if (emailRegex.test(v) || phoneRegex.test(v)) return true;
      throw new Error('Provide username or a valid email/phone number');
    }),
    body('password').isString().isLength({ min: 6 }),
    body('ownerKey').optional().isString().isLength({ min: ownerKeyMin })
  ],
  validate,
  authController.login
);

// Public status endpoint used by frontend to toggle login buttons before setup
router.get('/status', authController.status);

router.post(
  '/register',
  authenticate,
  authorize('admin', 'owner'),
  [
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6 }),
    body('name').optional().isString(),
    body('role').optional().custom((value, { req }) => {
      const v = String(value || '').trim();
      if (!v) return true;
      if (['teacher', 'student', 'driver', 'parent'].includes(v)) return true;
      if (v === 'admin' && req.user?.role === 'owner') return true;
      throw new Error('Invalid role');
    }),
    body('campusId').optional().isInt({ min: 1 }),
  ],
  validate,
  authController.register
);

router.post('/logout', authenticate, authController.logout);
router.post('/refresh', [body('refreshToken').isString()], validate, authController.refresh);
router.get('/profile', authenticate, authController.profile);
router.get('/users', authenticate, authController.getAllUsers);
router.get('/users/:id', authenticate, authController.getUserById);
router.put('/users/:id', authenticate, authorize('admin', 'owner'), validate, authController.updateUser);
router.delete('/users/:id', authenticate, authorize('admin', 'owner'), authController.deleteUser);

// Create missing user accounts from domain tables by role
router.post(
  '/backfill-users',
  authenticate,
  authorize('admin'),
  [body('role').isIn(['student', 'teacher', 'driver'])],
  validate,
  authController.backfillUsers
);

export default router;
