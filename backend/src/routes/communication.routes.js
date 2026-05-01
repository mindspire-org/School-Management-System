import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controller from '../controllers/communication.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Announcements
router.get('/announcements', authenticate, [query('audience').optional().isString()], validate, controller.listAnnouncements);
router.get('/announcements/:id', authenticate, [param('id').isInt()], validate, controller.getAnnouncementById);
router.post(
  '/announcements',
  authenticate,
  authorize('admin'),
  [body('title').isString().notEmpty(), body('message').isString().notEmpty(), body('audience').optional().isString()],
  validate,
  controller.createAnnouncement
);
router.put('/announcements/:id', authenticate, authorize('admin'), [param('id').isInt()], validate, controller.updateAnnouncement);
router.delete('/announcements/:id', authenticate, authorize('admin'), [param('id').isInt()], validate, controller.deleteAnnouncement);

// Alerts
router.get('/alerts', authenticate, controller.listAlerts);
router.get('/alerts/:id', authenticate, [param('id').isInt()], validate, controller.getAlertById);
router.post('/alerts', authenticate, authorize('admin'), [body('message').isString().notEmpty(), body('severity').optional().isIn(['info','warning','critical'])], validate, controller.createAlert);
router.put('/alerts/:id', authenticate, authorize('admin'), [param('id').isInt()], validate, controller.updateAlert);
router.delete('/alerts/:id', authenticate, authorize('admin'), [param('id').isInt()], validate, controller.deleteAlert);

// Local WhatsApp Web sending (admin/superadmin/owner)
router.post(
  '/whatsapp-web/send',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [body('to').isString().notEmpty(), body('text').isString().notEmpty()],
  validate,
  controller.whatsappWebSend
);

// Start WhatsApp Web session (launch for QR login)
router.post(
  '/whatsapp-web/start',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  controller.whatsappWebStart
);

export default router;
