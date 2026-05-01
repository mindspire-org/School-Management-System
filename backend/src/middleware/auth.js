import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    const payload = jwt.verify(token, secret);

    // Ensure campusId is always a number if present
    if (payload.campus_id && !payload.campusId) {
      payload.campusId = Number(payload.campus_id);
    } else if (payload.campusId) {
      payload.campusId = Number(payload.campusId);
    }

    // Support campus override for owner/superadmin only.
    // Campus admins (role=admin with a campusId) are restricted to their own campus.
    const campusHeader = req.headers['x-campus-id'];
    const isGlobalAdmin = payload.role === 'owner' || payload.role === 'superadmin';
    if (campusHeader && isGlobalAdmin) {
      const raw = String(campusHeader).trim();
      if (raw.toLowerCase() === 'all') {
        payload.campusId = null;
      } else {
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
    }
    // Branch admin / Campus admin: force campusId to their assigned campus, never allow override
    if ((payload.role === 'admin' || payload.role === 'branch_admin') && payload.campusId) {
      // campusId already set from JWT — do not allow changing it
    }

    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Optional auth: set req.user if a valid token is present, but never reject the request
export const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    const payload = jwt.verify(token, secret);
    if (payload.campus_id && !payload.campusId) {
      payload.campusId = Number(payload.campus_id);
    } else if (payload.campusId) {
      payload.campusId = Number(payload.campusId);
    }
    req.user = payload;
  } catch (_) {
    req.user = null;
  }
  next();
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.length) return next();
  const role = req.user?.role;

  // Superadmin has access to everything
  if (role === 'superadmin') return next();
  // Owner has access to everything
  if (role === 'owner') return next();

  // Branch admin is equivalent to admin for route access;
  // campus-level data scoping is enforced by resolveCampusId / JWT campusId.
  const effectiveRole = role === 'branch_admin' ? 'admin' : role;

  if (!effectiveRole || !roles.includes(effectiveRole)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
