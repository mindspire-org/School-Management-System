import { Router } from 'express';
import { CertificateTemplate, IssuedCertificate } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { query } from '../config/db.js';
import cloudinary from '../config/cloudinary.js';

const router = Router();

router.use(authenticate);

const adminRoles = new Set(['admin', 'owner', 'superadmin']);

const resolveCampusId = (req) => {
  const headerCampusId =
    req.headers?.['x-campus-id'] ??
    req.headers?.['x-campusid'] ??
    req.headers?.['campus-id'] ??
    req.headers?.['campusid'];
  const raw = headerCampusId ?? req.query?.campusId ?? req.body?.campusId;
  const requested = raw === '' || raw === undefined || raw === null ? null : raw;
  const role = req.user?.role;
  const authCampusId = req.user?.campusId;

  if (authCampusId && !adminRoles.has(role)) return Number(authCampusId);
  const resolved = requested ?? authCampusId;
  if (resolved === '' || resolved === undefined || resolved === null) return null;
  const n = Number(resolved);
  if (Number.isNaN(n)) return null;
  return n;
};

const stripCreatePayload = (payload) => {
  const p = { ...payload };
  delete p.id;
  delete p.campusId;
  delete p.campus_id;
  return p;
};

const stripUpdatePayload = (payload) => {
  const p = { ...payload };
  delete p.id;
  delete p.campusId;
  delete p.campus_id;
  return p;
};

const maybeUploadLogoUrl = async (logoUrl) => {
  if (!logoUrl || typeof logoUrl !== 'string') return logoUrl;
  if (!logoUrl.startsWith('data:')) return logoUrl;
  try {
    const upload = await cloudinary.uploader.upload(logoUrl, { folder: 'certificate-templates' });
    return upload?.secure_url || logoUrl;
  } catch (_) {
    return logoUrl;
  }
};

const maybeUploadAssetUrl = async (assetUrl) => {
  if (!assetUrl || typeof assetUrl !== 'string') return assetUrl;
  if (!assetUrl.startsWith('data:')) return assetUrl;
  try {
    const upload = await cloudinary.uploader.upload(assetUrl, { folder: 'certificate-templates' });
    return upload?.secure_url || assetUrl;
  } catch (_) {
    return assetUrl;
  }
};

const mapIssuedOut = (row) => {
  const json = row?.toJSON ? row.toJSON() : row;
  const type = json?.certificateType;
  const mapped = { ...json, type };
  if (type === 'Student') mapped.studentId = json.personId;
  if (type === 'Employee') mapped.employeeId = json.personId;
  return mapped;
};

router.get('/templates', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    const where = campusId ? { campusId } : {};
    if (req.query?.type) where.type = String(req.query.type);
    const items = await CertificateTemplate.findAll({ where });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/templates/:id', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    const item = await CertificateTemplate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (campusId && String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const payload = stripCreatePayload(req.body);
    payload.logoUrl = await maybeUploadLogoUrl(payload.logoUrl);
    payload.backgroundImageUrl = await maybeUploadAssetUrl(payload.backgroundImageUrl);
    payload.watermarkImageUrl = await maybeUploadAssetUrl(payload.watermarkImageUrl);
    payload.signature1ImageUrl = await maybeUploadAssetUrl(payload.signature1ImageUrl);
    payload.signature2ImageUrl = await maybeUploadAssetUrl(payload.signature2ImageUrl);
    const created = await CertificateTemplate.create({ ...payload, campusId });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/templates/:id', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const item = await CertificateTemplate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (campusId && String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
    const payload = stripUpdatePayload(req.body);
    payload.logoUrl = await maybeUploadLogoUrl(payload.logoUrl);
    payload.backgroundImageUrl = await maybeUploadAssetUrl(payload.backgroundImageUrl);
    payload.watermarkImageUrl = await maybeUploadAssetUrl(payload.watermarkImageUrl);
    payload.signature1ImageUrl = await maybeUploadAssetUrl(payload.signature1ImageUrl);
    payload.signature2ImageUrl = await maybeUploadAssetUrl(payload.signature2ImageUrl);
    await item.update({ ...payload, campusId });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/templates/:id', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const item = await CertificateTemplate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (campusId && String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/students', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    const where = { certificateType: 'Student', ...(campusId ? { campusId } : {}) };
    const items = await IssuedCertificate.findAll({ where });
    res.json(items.map(mapIssuedOut));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/employees', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    const where = { certificateType: 'Employee', ...(campusId ? { campusId } : {}) };
    const items = await IssuedCertificate.findAll({ where });
    res.json(items.map(mapIssuedOut));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/students', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const body = req.body || {};
    const personId = body.studentId ?? body.personId;
    if (!personId) return res.status(400).json({ error: 'studentId is required' });

    let personName = body.personName || body.studentName;
    if (!personName) {
      try {
        const { rows } = await query(
          'SELECT name FROM students WHERE id = $1 AND campus_id = $2 LIMIT 1',
          [Number(personId), campusId]
        );
        if (rows?.[0]?.name) personName = rows[0].name;
      } catch (_) {}
    }

    const payload = stripCreatePayload(body);
    const created = await IssuedCertificate.create({
      ...payload,
      campusId,
      certificateType: 'Student',
      personId: Number(personId),
      personName: String(personName || 'Unknown'),
    });
    res.status(201).json(mapIssuedOut(created));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const body = req.body || {};
    const personId = body.employeeId ?? body.personId;
    if (!personId) return res.status(400).json({ error: 'employeeId is required' });

    let personName = body.personName || body.employeeName;
    if (!personName) {
      try {
        const { rows } = await query(
          'SELECT name FROM teachers WHERE id = $1 AND campus_id = $2 LIMIT 1',
          [Number(personId), campusId]
        );
        if (rows?.[0]?.name) personName = rows[0].name;
      } catch (_) {}
    }

    const payload = stripCreatePayload(body);
    const created = await IssuedCertificate.create({
      ...payload,
      campusId,
      certificateType: 'Employee',
      personId: Number(personId),
      personName: String(personName || 'Unknown'),
    });
    res.status(201).json(mapIssuedOut(created));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const item = await IssuedCertificate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (campusId && String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
    if (String(item.certificateType) !== 'Student') return res.status(404).json({ error: 'Not found' });
    const payload = stripUpdatePayload(req.body);
    await item.update({ ...payload, campusId });
    res.json(mapIssuedOut(item));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/employees/:id', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const item = await IssuedCertificate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (campusId && String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
    if (String(item.certificateType) !== 'Employee') return res.status(404).json({ error: 'Not found' });
    const payload = stripUpdatePayload(req.body);
    await item.update({ ...payload, campusId });
    res.json(mapIssuedOut(item));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const item = await IssuedCertificate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (campusId && String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
    if (String(item.certificateType) !== 'Student') return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/employees/:id', async (req, res) => {
  try {
    const campusId = resolveCampusId(req);
    if (!campusId) return res.status(400).json({ error: 'campusId is required' });
    const item = await IssuedCertificate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (campusId && String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
    if (String(item.certificateType) !== 'Employee') return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
