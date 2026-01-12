import * as parents from '../services/parents.service.js';
import { ensureParentsSchema } from '../db/autoMigrate.js';
import * as settingsSvc from '../services/settings.service.js';

export const list = async (req, res, next) => {
  try {
    await ensureParentsSchema();
    // Backfill parents table from students having family_number to ensure legacy data shows up
    try { await parents.backfillFromStudents(); } catch (_) { }
    const { q, page = 1, pageSize = 50 } = req.query;
    const campusId = req.user?.campusId;
    const data = await parents.list({ q, page: Number(page), pageSize: Number(pageSize), campusId });
    res.json(data);
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    await ensureParentsSchema();
    const p = await parents.getById(Number(req.params.id));
    if (!p) return res.status(404).json({ message: 'Parent not found' });
    res.json(p);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    await ensureParentsSchema();
    const payload = { ...(req.body || {}) };
    payload.campusId = req.user?.campusId || payload.campusId;
    if (!payload.campusId) return res.status(400).json({ message: 'Campus ID is required' });
    const p = await parents.create(payload);
    res.status(201).json(p);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    await ensureParentsSchema();
    const p = await parents.update(Number(req.params.id), req.body || {});
    if (!p) return res.status(404).json({ message: 'Parent not found' });
    res.json(p);
  } catch (e) { next(e); }
};

// Inform endpoint: send a custom message to parent's WhatsApp for a specific child
export const inform = async (req, res, next) => {
  try {
    await ensureParentsSchema();
    const { id } = req.params;
    const { childId, message } = req.body || {};
    if (!message) return res.status(400).json({ message: 'Message is required' });
    const p = await parents.getById(Number(id));
    if (!p) return res.status(404).json({ message: 'Parent not found' });
    const hasChild = Array.isArray(p.children) && p.children.some((c) => String(c.id) === String(childId));
    if (childId && !hasChild) return res.status(400).json({ message: 'Child not linked to this parent' });

    // Optional webhook integration
    let delivered = false;
    let via = 'noop';
    const normalizePk = (raw) => {
      if (!raw) return raw;
      const digits = String(raw).replace(/\D/g, '');
      if (digits.startsWith('92')) return `+${digits}`;
      if (digits.startsWith('0')) return `+92${digits.slice(1)}`;
      if (digits.length === 10 && digits.startsWith('3')) return `+92${digits}`;
      return raw.startsWith('+') ? raw : `+${digits}`;
    };
    const toNumber = normalizePk(p.whatsappPhone);
    try {
      let webhook = process.env.WHATSAPP_WEBHOOK_URL;
      if (!webhook) {
        try {
          const item = await settingsSvc.getByKey('whatsapp.webhook.url');
          webhook = item?.value || '';
        } catch (_) { }
      }
      if (!delivered && webhook && toNumber && typeof fetch === 'function') {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: toNumber, text: message, familyNumber: p.familyNumber, childId })
        });
        delivered = true;
        via = 'webhook';
      }
    } catch (_) { }

    // WhatsApp Cloud API (fallback if webhook not configured)
    try {
      if (!delivered && toNumber && typeof fetch === 'function') {
        let cloudToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
        let cloudPhoneId = process.env.WHATSAPP_CLOUD_PHONE_ID;
        if (!cloudToken) {
          try { cloudToken = (await settingsSvc.getByKey('whatsapp.cloud.access_token'))?.value || ''; } catch (_) { }
        }
        if (!cloudPhoneId) {
          try { cloudPhoneId = (await settingsSvc.getByKey('whatsapp.cloud.phone_id'))?.value || ''; } catch (_) { }
        }
        if (cloudToken && cloudPhoneId) {
          const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(cloudPhoneId)}/messages`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${cloudToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: toNumber.replace(/^\+/, ''),
              type: 'text',
              text: { body: message },
            })
          });
          if (resp.ok) {
            delivered = true;
            via = 'cloud';
          }
        }
      }
    } catch (_) { }

    res.json({ success: true, delivered, via, to: toNumber || null });
  } catch (e) { next(e); }
};
export const remove = async (req, res, next) => {
  try {
    const success = await parents.remove(Number(req.params.id));
    if (!success) return res.status(404).json({ message: 'Parent not found' });
    res.json({ success: true });
  } catch (e) { next(e); }
};
