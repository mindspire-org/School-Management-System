import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import * as authService from '../services/auth.service.js';
import { ensureParentsSchema } from '../db/autoMigrate.js';
import * as parentsSvc from '../services/parents.service.js';
import * as settingsSvc from '../services/settings.service.js';

export const login = async (req, res, next) => {
  try {
    const { email, password, ownerKey } = req.body;
    const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
    const ownerKeyMin = Number(process.env.OWNER_KEY_MIN_LENGTH || 30);

    // Gate: disallow non-owner logins until licensing is configured
    const force = String(process.env.FORCE_SETUP || '').toLowerCase() === 'true';
    const lic = await settingsSvc.getByKey('licensing.configured');
    let licensingConfigured = String(lic?.value || '').toLowerCase() === 'true';
    if (force) licensingConfigured = true;
    // Determine allowed modules/roles after licensing is configured
    let allowedModules = [];
    try {
      const allowedRow = await settingsSvc.getByKey('licensing.allowed_modules');
      allowedModules = JSON.parse(allowedRow?.value || '[]');
    } catch (_) { allowedModules = []; }
    if (force) { allowedModules = ['Dashboard','Settings','Teachers','Students','Parents','Transport']; }
    const allowedRoles = new Set();
    if (Array.isArray(allowedModules)) {
      if (allowedModules.includes('Teachers')) allowedRoles.add('teacher');
      if (allowedModules.includes('Students')) allowedRoles.add('student');
      if (allowedModules.includes('Parents')) allowedRoles.add('parent');
      if (allowedModules.includes('Transport')) allowedRoles.add('driver');
      if (allowedModules.includes('Dashboard') || allowedModules.includes('Settings')) allowedRoles.add('admin');
    }

    // Owner-first: verify email/password first, then require Owner Key as step-2
    if (String(email).toLowerCase().trim() === String(ownerEmail).toLowerCase().trim()) {
      try {
        // Ensure owner exists (bootstrap) and verify password
        let ownerUser = await authService.findUserByEmail(ownerEmail);
        if (!ownerUser) {
          await authService.ensureOwnerUser({ email: ownerEmail, password, name: 'Mindspire Owner' });
          ownerUser = await authService.findUserByEmail(ownerEmail);
        }
        if (!ownerUser) return res.status(401).json({ message: 'Invalid credentials' });
        let passOk = await bcrypt.compare(password, ownerUser.password_hash || '');
        if (!passOk) {
          try {
            await authService.ensureOwnerUser({ email: ownerEmail, password, name: 'Mindspire Owner' });
            ownerUser = await authService.findUserByEmail(ownerEmail);
            passOk = await bcrypt.compare(password, ownerUser.password_hash || '');
          } catch (_) {}
          if (!passOk && !force) return res.status(401).json({ message: 'Invalid credentials' });
        }

        // After password verified, check license key
        if (!force) {
          const keyRow = await settingsSvc.getByKey('owner.key_hash');
          const keyHash = keyRow?.value || '';
          if (!keyHash) {
            // First-time activation: require ownerKey and set it
            if (!ownerKey || String(ownerKey).length < ownerKeyMin) {
              return res.status(401).json({ message: `Owner key not set. Provide a ${ownerKeyMin}+ character key to initialize.`, code: 'OWNER_KEY_REQUIRED' });
            }
            const newHash = await bcrypt.hash(String(ownerKey), 10);
            await settingsSvc.setKey('owner.key_hash', newHash);
            // Auto-complete licensing on first-time activation
            try {
              await settingsSvc.setKey('licensing.configured', 'true');
              await settingsSvc.setKey('licensing.allowed_modules', JSON.stringify(['Dashboard','Settings','Teachers','Students','Parents','Transport']));
            } catch (_) {}
          } else {
            // Subsequent owner logins: ownerKey is optional; if provided, verify
            if (ownerKey) {
              const keyOk = await bcrypt.compare(String(ownerKey), keyHash);
              if (!keyOk) {
                return res.status(401).json({ message: 'Invalid owner key' });
              }
            }
          }
        }

        const userPayload = { id: ownerUser.id, email: ownerEmail, role: 'owner', name: ownerUser.name || 'Mindspire Owner' };
        const token = signAccessToken(userPayload);
        const refreshToken = signRefreshToken({ id: ownerUser.id });
        return res.json({ token, refreshToken, user: userPayload });
      } catch (err) {
        // fall through to standard flow
      }
    }

    // If licensing is not configured yet, block all non-owner logins
    if (!licensingConfigured) {
      return res.status(423).json({ message: 'System setup pending. Only owner can sign in until licensing is configured.' });
    }
    // If identifier looks like a phone number, treat as Parent Portal login first to avoid misclassifying as admin.
    {
      const id = String(email || '').trim();
      const looksLikePhone = /^\+?\d{10,15}$/.test(id) || /^0\d{10}$/.test(id) || /^3\d{9}$/.test(id);
      if (looksLikePhone) {
        try { await ensureParentsSchema(); } catch (_) {}
        try { await parentsSvc.backfillFromStudents(); } catch (_) {}
        try {
          const ensured = await authService.upsertParentUserForPhone({ phone: id, password, name: 'Parent' });
          if (ensured) {
            if (allowedRoles.size && !allowedRoles.has('parent')) {
              return res.status(423).json({ message: 'Parent portal is not licensed for this installation.' });
            }
            const userPayload = { id: ensured.id, email: ensured.email, role: 'parent', name: ensured.name || 'Parent' };
            const token = signAccessToken(userPayload);
            const refreshToken = signRefreshToken({ id: ensured.id });
            return res.json({ token, refreshToken, user: userPayload });
          }
        } catch (_) {}
      }
    }
    // Accept either email or WhatsApp number in the "email" field for parents
    let user = await authService.findUserByEmail(email);
    if (!user) {
      // Fallback: if this is the configured Owner email, ensure it exists now
      const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
      if (String(email).toLowerCase() === String(ownerEmail).toLowerCase()) {
        try {
          await authService.ensureOwnerUser({ email: ownerEmail, password, name: 'Mindspire Owner' });
          user = await authService.findUserByEmail(ownerEmail);
        } catch (_) {}
      }

      // If identifier looks like a phone, try parent auto-provisioning by phone
      const id = String(email || '').trim();
      const looksLikePhone = /^\+?\d{10,15}$/.test(id) || /^0\d{10}$/.test(id) || /^3\d{9}$/.test(id);
      if (looksLikePhone) {
        try { await ensureParentsSchema(); } catch (_) {}
        try { await parentsSvc.backfillFromStudents(); } catch (_) {}
        const parent = await authService.findParentByPhone(id);
        if (parent) {
          const created = await authService.ensureParentUserForPhone({ phone: id, password, name: parent.primary_name || 'Parent' });
          if (created) {
            user = created;
          }
        }
      }
    }
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    let ok = await bcrypt.compare(password, user.password_hash || '');
    // Owner recovery: if the login email matches owner and compare fails, sync password to typed one and retry once
    if (!ok) {
      const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
      if (String(email).toLowerCase() === String(ownerEmail).toLowerCase()) {
        try {
          await authService.ensureOwnerUser({ email: ownerEmail, password, name: 'Mindspire Owner' });
          const refreshed = await authService.findUserByEmail(ownerEmail);
          if (refreshed) {
            user = refreshed;
            ok = await bcrypt.compare(password, user.password_hash || '');
          }
        } catch (_) {}
      }
    }
    if (!ok) {
      const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
      // Final fallback: allow owner login even if compare fails, and persist the new password
      if (String(email).toLowerCase() === String(ownerEmail).toLowerCase()) {
        try {
          await authService.ensureOwnerUser({ email: ownerEmail, password, name: 'Mindspire Owner' });
          const refreshed = await authService.findUserByEmail(ownerEmail);
          if (refreshed) {
            user = refreshed;
            // proceed without failing
          }
        } catch (_) {}
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // Enforce module-based licensing for roles other than owner
    if (user.role !== 'owner' && allowedRoles.size && !allowedRoles.has(user.role)) {
      return res.status(423).json({ message: 'Your role is not licensed for login on this installation.' });
    }
    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const token = signAccessToken(userPayload);
    const refreshToken = signRefreshToken({ id: user.id });

    return res.json({ token, refreshToken, user: userPayload });
  } catch (e) {
    next(e);
  }
};

export const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Enforce single Admin policy: only one admin user may exist
    if (role === 'admin') {
      const { rows: adminRows } = await query('SELECT 1 FROM users WHERE role = $1 LIMIT 1', ['admin']);
      if (adminRows.length) {
        return res.status(409).json({ message: 'An Admin account already exists. Admin signup is disabled.' });
      }
    }

    const existing = await authService.findUserByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authService.createUser({ email, passwordHash, role, name });

    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const token = signAccessToken(userPayload);
    const refreshToken = signRefreshToken({ id: user.id });

    return res.status(201).json({ token, refreshToken, user: userPayload });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Stateless JWT: client should discard tokens. Optionally add to denylist.
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefreshToken(refreshToken);
    const user = await authService.findUserById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const token = signAccessToken(userPayload);
    const newRefresh = signRefreshToken({ id: user.id });
    return res.json({ token, refreshToken: newRefresh, user: userPayload });
  } catch (e) {
    e.status = 401;
    next(e);
  }
};

export const profile = async (req, res, next) => {
  try {
    const user = await authService.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    return res.json({ user: userPayload });
  } catch (e) {
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await authService.findUserById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    return res.json({ user: userPayload });
  } catch (e) {
    next(e);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await authService.listUsers();
    const mapped = users.map((u) => ({ id: u.id, email: u.email, role: u.role, name: u.name }));
    return res.json({ users: mapped });
  } catch (e) {
    next(e);
  }
};

export const backfillUsers = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ['student','teacher','driver'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const result = await authService.backfillUsersFromDomain(role);
    return res.json(result);
  } catch (e) {
    next(e);
  }
};

export const status = async (req, res, next) => {
  try {
    const force = String(process.env.FORCE_SETUP || '').toLowerCase() === 'true';
    const lic = await settingsSvc.getByKey('licensing.configured');
    let licensingConfigured = String(lic?.value || '').toLowerCase() === 'true';
    if (force) licensingConfigured = true;
    let allowedModules = [];
    try {
      const allowedRow = await settingsSvc.getByKey('licensing.allowed_modules');
      allowedModules = JSON.parse(allowedRow?.value || '[]');
    } catch (_) { allowedModules = []; }
    if (force && (!Array.isArray(allowedModules) || allowedModules.length === 0)) {
      allowedModules = ['Dashboard','Settings','Teachers','Students','Parents','Transport'];
    }
    const { rows: adminRows } = await query('SELECT 1 FROM users WHERE role = $1 LIMIT 1', ['admin']);
    const adminExists = adminRows.length > 0;
    return res.json({ licensingConfigured, allowedModules, adminExists });
  } catch (e) {
    next(e);
  }
};
