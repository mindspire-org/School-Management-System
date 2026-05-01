import { Router } from 'express';
import * as controller from '../controllers/webhooks.controller.js';

const router = Router();

// Twilio Messaging Webhook (no auth)
router.post('/twilio/messages', controller.twilioInbound);

export default router;
