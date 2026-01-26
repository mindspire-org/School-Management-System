import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    const payload = jwt.verify(token, secret);

    // Support campus override for administrators
    const campusHeader = req.headers['x-campus-id'];
    if (campusHeader && (payload.role === 'owner' || payload.role === 'superadmin')) {
      const raw = String(campusHeader).trim();
      const parsed = Number(raw);
      if (!Number.isNaN(parsed) && parsed > 0) {
        payload.campusId = parsed;
      } else if (raw) {
        try {
          const { rows } = await query(
            'SELECT id FROM campuses WHERE LOWER(name) = LOWER($1) LIMIT 1',
            [raw]
          );
          if (rows[0]?.id) payload.campusId = rows[0].id;
        } catch (_) {}
      }
    }

    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.length) return next();
  const role = req.user?.role;
  if (!role || !roles.includes(role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
