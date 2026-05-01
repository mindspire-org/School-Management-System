import * as service from '../services/communication.service.js';
import * as waWeb from '../services/whatsappWeb.service.js';

// Announcements
export const listAnnouncements = async (req, res, next) => {
  try {
    const items = await service.listAnnouncements({
      audience: req.query.audience,
      campusId: req.user?.campusId
    });
    res.json({ items });
  } catch (e) { next(e); }
};

export const getAnnouncementById = async (req, res, next) => {
  try {
    const item = await service.getAnnouncementById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Announcement not found' });
    res.json(item);
  } catch (e) { next(e); }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const createdBy = req.user?.id;
    const item = await service.createAnnouncement({
      ...req.body,
      createdBy,
      campusId: req.user?.campusId
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const item = await service.updateAnnouncement(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'Announcement not found' });
    res.json(item);
  } catch (e) { next(e); }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    await service.deleteAnnouncement(req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
};

// Alerts
export const listAlerts = async (req, res, next) => {
  try {
    res.json({ items: await service.listAlerts(req.user?.campusId) });
  } catch (e) { next(e); }
};

export const getAlertById = async (req, res, next) => {
  try {
    const item = await service.getAlertById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Alert not found' });
    res.json(item);
  } catch (e) { next(e); }
};

export const createAlert = async (req, res, next) => {
  try {
    const createdBy = req.user?.id;
    const item = await service.createAlert({
      ...req.body,
      createdBy,
      campusId: req.user?.campusId
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
};

export const updateAlert = async (req, res, next) => {
  try {
    const item = await service.updateAlert(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'Alert not found' });
    res.json(item);
  } catch (e) { next(e); }
};

export const deleteAlert = async (req, res, next) => {
  try {
    await service.deleteAlert(req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
};

// WhatsApp Web (local machine) send
export const whatsappWebSend = async (req, res, next) => {
  try {
    const { to, text } = req.body || {};
    if (!to || !text) return res.status(400).json({ message: 'to and text are required' });
    // Respond immediately; perform send in background to avoid client timeouts on first launch
    setTimeout(async () => {
      try {
        await waWeb.start();
        await waWeb.sendText({ to, text });
      } catch (_) {}
    }, 0);
    res.status(202).json({ queued: true });
  } catch (e) { next(e); }
};

// WhatsApp Web (local machine) start/launch for QR login
export const whatsappWebStart = async (req, res, next) => {
  try {
    const out = await waWeb.start();
    res.json(out || { ready: true });
  } catch (e) { next(e); }
};
