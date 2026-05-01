import { query } from '../config/db.js';
import * as parentMsgs from '../services/parentMessages.service.js';
import { ensureParentsSchema } from '../db/autoMigrate.js';

/**
 * Normalize a phone number string to digits only (no +, spaces, dashes).
 * e.g. '+92 300 1234567' -> '923001234567'
 */
const digitsOnly = (raw) => {
  if (!raw) return '';
  // Strip whatsapp: prefix (Twilio prefixes WhatsApp numbers with 'whatsapp:')
  const s = String(raw).replace(/^whatsapp:/i, '').trim();
  return s.replace(/\D/g, '');
};

const toE164 = (raw) => {
  if (!raw) return '';
  const s = String(raw).replace(/^whatsapp:/i, '').trim();
  const digits = s.replace(/\D/g, '');
  if (!digits) return '';
  return `+${digits}`;
};

export const twilioInbound = async (req, res, next) => {
  try {
    await ensureParentsSchema();
    const fromRaw = req.body?.From || req.body?.from || '';
    const toRaw = req.body?.To || req.body?.to || '';
    const body = req.body?.Body || req.body?.body || '';
    if (!fromRaw || !body) return res.status(400).json({ ok: false });

    const from = toE164(fromRaw);
    const to = toE164(toRaw);

    // Detect channel from Twilio's 'From' field prefix (whatsapp:+92... vs plain number)
    const isWhatsApp = String(fromRaw).toLowerCase().startsWith('whatsapp:');
    const channel = isWhatsApp ? 'whatsapp' : 'sms';

    // Normalize the incoming number to digits only for reliable matching.
    // Stored whatsapp_phone can be in many formats: +923001234567, 03001234567, 923001234567
    const fromDigits = digitsOnly(fromRaw); // e.g. '923001234567'
    // Also build a local variant (strip leading 92, replace with 0) for matching stored '0300...' numbers
    const fromLocal = fromDigits.startsWith('92') ? '0' + fromDigits.slice(2) : fromDigits;

    // Match parents whose whatsapp_phone (stripped of non-digits) equals either variant
    const { rows } = await query(
      `SELECT id FROM parents
       WHERE REGEXP_REPLACE(whatsapp_phone, '[^0-9]', '', 'g') = $1
          OR REGEXP_REPLACE(whatsapp_phone, '[^0-9]', '', 'g') = $2
       LIMIT 1`,
      [fromDigits, fromLocal]
    );
    const parentId = rows[0]?.id || null;

    if (parentId) {
      await parentMsgs.create({
        parentId,
        childId: null,
        to,
        from,
        channel,
        direction: 'inbound',
        body,
        status: 'received',
        campusId: null
      });
    }

    // Twilio expects a 200 TwiML or empty 200 response
    res.status(200).set('Content-Type', 'text/xml').send('<Response></Response>');
  } catch (e) { next(e); }
};
