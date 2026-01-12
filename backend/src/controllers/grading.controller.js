import * as grading from '../services/grading.service.js';

export const listSchemes = async (req, res, next) => {
  try {
    const items = await grading.listSchemes(req.user?.campusId);
    res.json({ items });
  } catch (e) { next(e); }
};

export const getDefaultScheme = async (req, res, next) => {
  try {
    const item = await grading.getDefaultScheme(req.user?.campusId);
    res.json(item || {});
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    const item = await grading.getById(Number(req.params.id));
    if (!item) return res.status(404).json({ message: 'Grading scheme not found' });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const payload = {
      name: (req.body.name || 'Default').trim(),
      academicYear: req.body.academicYear || '',
      bands: req.body.bands || {},
      isDefault: !!req.body.isDefault,
      userId: req.user?.id,
      campusId: req.user?.campusId,
    };
    const created = await grading.create(payload);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await grading.update(id, {
      name: req.body.name,
      academicYear: req.body.academicYear,
      bands: req.body.bands,
      isDefault: req.body.isDefault,
    });
    if (!updated) return res.status(404).json({ message: 'Grading scheme not found' });
    res.json(updated);
  } catch (e) { next(e); }
};

export const setDefault = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const scheme = await grading.setDefault(id);
    res.json(scheme);
  } catch (e) { next(e); }
};

export const compute = async (req, res, next) => {
  try {
    const { percentage, obtained, fullMarks, schemeId } = req.body || {};
    let pct = Number(percentage);
    if (!Number.isFinite(pct) && obtained != null && fullMarks) {
      const num = Number(obtained);
      const den = Number(fullMarks);
      pct = den > 0 ? (num / den) * 100 : 0;
    }
    pct = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
    let bands = {};
    if (schemeId) {
      const scheme = await grading.getById(Number(schemeId));
      bands = scheme?.bands || {};
    } else {
      const def = await grading.getDefaultScheme(req.user?.campusId);
      bands = def?.bands || {};
    }
    const grade = grading.computeGrade(pct, bands);
    res.json({ percentage: pct, grade });
  } catch (e) { next(e); }
};
