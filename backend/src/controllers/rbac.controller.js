import * as rbac from '../services/rbac.service.js';
import * as settingsSvc from '../services/settings.service.js';

export const listRoles = async (req, res, next) => {
  try {
    const items = await rbac.listRoles();
    res.json({ items });
  } catch (e) { next(e); }
};

export const setRoleActive = async (req, res, next) => {
  try {
    const role = String(req.params.role || '').toLowerCase();
    const { active } = req.body;
    const item = await rbac.setRoleActive(role, Boolean(active));
    res.json(item);
  } catch (e) { next(e); }
};

export const listPermissions = async (req, res, next) => {
  try {
    const data = await rbac.listPermissions();
    // Dynamic licensing filter: only show permissions for purchased + assigned modules
    // 1) Licensing allowed modules (display names array)
    let licAllowed = [];
    try {
      const licRow = await settingsSvc.getByKey('licensing.allowed_modules');
      licAllowed = JSON.parse(licRow?.value || '[]');
    } catch (_) { licAllowed = []; }
    const toKey = (n) => {
      if (!n) return null;
      const s = String(n).toLowerCase();
      // Map display names to internal module keys used in permissions
      const map = {
        students: 'students', teachers: 'teachers', parents: 'parents',
        finance: 'finance', transport: 'transport', attendance: 'attendance',
        reports: 'reports', communication: 'communication', settings: 'settings', dashboard: 'dashboard', academics: 'academics'
      };
      return map[s] || s;
    };
    const licKeys = new Set(licAllowed.map(toKey).filter(Boolean));

    // 2) Admin-assigned allowed modules (display names array) for intersection
    let adminAllowed = [];
    try {
      const mods = await rbac.listModuleAssignments();
      adminAllowed = mods?.assignments?.admin?.allowModules || [];
    } catch (_) { adminAllowed = []; }
    const adminKeys = new Set(adminAllowed.map(toKey).filter(Boolean));

    // Compute effective allowed keys based on who is requesting
    const requesterRole = String(req.user?.role || '').toLowerCase();
    let allowedKeys;
    if (requesterRole === 'owner') {
      // Owner sees intersection of what was purchased and what Admin is configured to use
      allowedKeys = new Set(Array.from(adminKeys).filter((k) => licKeys.has(k)));
    } else {
      // Admin sees only modules they are assigned AND that are licensed
      // Their own assignment equals adminKeys; intersect with licKeys.
      allowedKeys = new Set(Array.from(adminKeys).filter((k) => licKeys.has(k)));
    }

    // Reduce permissions list and assignments to only allowed modules
    const filterPerm = (p) => {
      const mod = String(p).split('.')[0];
      return allowedKeys.has(mod);
    };
    const allPerms = Array.isArray(data?.allPerms) ? data.allPerms.filter(filterPerm) : [];
    const assignments = {};
    for (const [role, perms] of Object.entries(data?.assignments || {})) {
      assignments[role] = Array.isArray(perms) ? perms.filter(filterPerm) : [];
    }
    res.json({ roles: data?.roles || [], allPerms, assignments });
  } catch (e) { next(e); }
};

export const setPermissionsForRole = async (req, res, next) => {
  try {
    const role = String(req.params.role || '').toLowerCase();
    const perms = Array.isArray(req.body.perms) ? req.body.perms : [];
    const item = await rbac.setPermissionsForRole(role, perms);
    res.json(item);
  } catch (e) { next(e); }
};

// Module-level access APIs
export const listModules = async (req, res, next) => {
  try {
    const data = await rbac.listModuleAssignments();
    res.json(data);
  } catch (e) { next(e); }
};

export const setModulesForRole = async (req, res, next) => {
  try {
    const role = String(req.params.role || '').toLowerCase();
    const allowModules = Array.isArray(req.body.allowModules) ? req.body.allowModules : [];
    const allowSubroutes = Array.isArray(req.body.allowSubroutes) ? req.body.allowSubroutes : [];
    const item = await rbac.setModulesForRole(role, { allowModules, allowSubroutes });
    res.json(item);
  } catch (e) { next(e); }
};

export const deleteRole = async (req, res, next) => {
  try {
    const role = String(req.params.role || '').toLowerCase();
    const result = await rbac.deleteRole(role);
    res.json(result);
  } catch (e) {
    const msg = e?.message || 'Failed to delete role';
    const status = msg.includes('Cannot delete') ? 400 : 500;
    res.status(status).json({ message: msg });
  }
};

export const getMyModules = async (req, res, next) => {
  try {
    const role = String(req.user?.role || '').toLowerCase();
    if (!role) return res.status(400).json({ message: 'No role' });

    // Teacher and student portals show all their own portal sections.
    // Branch admins see all admin modules — their data is scoped by campusId server-side.
    // Their data access is already scoped server-side by user_id/campus_id,
    // so client-side module filtering via admin-portal RBAC names is not needed.
    if (role === 'teacher' || role === 'student' || role === 'branch_admin') {
      return res.json({ allowModules: 'ALL', allowSubroutes: 'ALL' });
    }

    const data = await rbac.listModuleAssignments();
    const item = data?.assignments?.[role] || { allowModules: [], allowSubroutes: [] };
    res.json(item);
  } catch (e) { next(e); }
};
