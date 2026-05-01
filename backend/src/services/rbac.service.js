import { query } from '../config/db.js';
import * as settings from './settings.service.js';

const FIXED_ROLES = ['owner','admin','branch_admin','teacher','student','driver','parent'];
const ALL_PERMS = [
  'students.view','students.edit','students.export','students.manage',
  'teachers.view','teachers.edit','teachers.export','teachers.manage',
  'finance.view','finance.edit','finance.export',
  'transport.view','transport.edit',
  'attendance.view','attendance.edit','attendance.export',
  'reports.view','reports.export',
  'communication.send',
  'settings.manage',
  'licensing.manage',
  // Parents module
  'parents.view','parents.edit','parents.manage','parents.inform'
];

// Map fine-grained permissions to specific subroutes in the Admin layout
// Only include key landing pages so the sidebar stays minimal when granting just 
// "*.view" permissions.
const PERM_TO_SUBROUTES = {
  // Students
  'students.view': ['/students/list'],
  'students.edit': ['/students/add','/students/edit/:id'],
  'students.manage': ['/students/add','/students/edit/:id'],
  'students.export': ['/students/list'],
  // Teachers
  'teachers.view': ['/teachers/list'],
  'teachers.edit': ['/teachers/add'],
  'teachers.manage': ['/teachers/add'],
  'teachers.export': ['/teachers/list'],
  // Attendance
  'attendance.view': ['/attendance/daily'],
  'attendance.edit': ['/attendance/manual'],
  'attendance.export': ['/attendance/reports'],
  // Transport
  'transport.view': ['/transport/buses'],
  'transport.edit': ['/transport/drivers','/transport/routes'],
  // Finance
  'finance.view': ['/finance/dashboard'],
  'finance.edit': ['/finance/invoices','/finance/payments'],
  'finance.export': ['/finance/reports'],
  // Settings
  'settings.manage': ['/settings/system'],
  // Licensing (Owner)
  'licensing.manage': ['/settings/licensing'],
  // Parents
  'parents.view': ['/parents/list'],
  'parents.edit': ['/parents/list'],
  'parents.manage': ['/parents/list'],
  'parents.inform': ['/parents/inform'],
};

export const listRoles = async () => {
  const { rows } = await query('SELECT role, COUNT(*)::int AS count FROM users GROUP BY role');
  const counts = Object.fromEntries(rows.map(r => [r.role, r.count]));
  const items = [];
  for (const r of FIXED_ROLES) {
    const activeKey = `role.active.${r}`;
    const activeItem = await settings.getByKey(activeKey);
    const active = activeItem ? activeItem.value === 'true' : true;
    items.push({ id: r, name: r.charAt(0).toUpperCase() + r.slice(1), users: counts[r] || 0, active });
  }
  return items;
};

export const setRoleActive = async (role, active) => {
  if (!FIXED_ROLES.includes(role)) throw new Error('Invalid role');
  const key = `role.active.${role}`;
  const v = active ? 'true' : 'false';
  return settings.setKey(key, v);
};

export const listPermissions = async () => {
  const assignments = {};
  for (const r of FIXED_ROLES) {
    const key = `perms.${r}`;
    const item = await settings.getByKey(key);
    try {
      assignments[r] = item ? JSON.parse(item.value) : [];
    } catch (_) {
      assignments[r] = [];
    }
  }
  return { roles: FIXED_ROLES, allPerms: ALL_PERMS, assignments };
};

export const setPermissionsForRole = async (role, perms = []) => {
  if (!FIXED_ROLES.includes(role)) throw new Error('Invalid role');
  const valid = perms.filter(p => ALL_PERMS.includes(p));
  const key = `perms.${role}`;
  const saved = await settings.setKey(key, JSON.stringify(valid));
  // Derive module + subroute allow lists from granted permissions for convenience
  try {
    const moduleKeys = new Set(valid.map((p) => String(p).split('.')[0]));
    // Map keys to display names that match frontend route names
    const displayMap = {
      students: 'Students',
      teachers: 'Teachers',
      finance: 'Finance',
      transport: 'Transport',
      attendance: 'Attendance',
      reports: 'Reports',
      communication: 'Communication',
      settings: 'Settings',
      parents: 'Parents',
    };
    const allowModules = Array.from(moduleKeys)
      .map((k) => displayMap[k])
      .filter(Boolean);
    // Derive subroutes precisely from permissions
    const allowSubroutes = Array.from(new Set(valid.flatMap((p) => PERM_TO_SUBROUTES[p] || [])));
    await settings.setKey(`modules.allow.${role}`, JSON.stringify(allowModules));
    await settings.setKey(`subroutes.allow.${role}`, JSON.stringify(allowSubroutes));
  } catch (_) {}
  return saved;
};

// Module-level access management (deny lists per role)
export const listModuleAssignments = async () => {
  const assignments = {};
  for (const r of FIXED_ROLES) {
    const mKey = `modules.allow.${r}`;
    const sKey = `subroutes.allow.${r}`;
    const mItem = await settings.getByKey(mKey);
    const sItem = await settings.getByKey(sKey);
    let allowModules = [];
    let allowSubroutes = [];
    try { allowModules = mItem ? JSON.parse(mItem.value) : []; } catch (_) { allowModules = []; }
    try { allowSubroutes = sItem ? JSON.parse(sItem.value) : []; } catch (_) { allowSubroutes = []; }
    assignments[r] = { allowModules, allowSubroutes };
  }
  return { roles: FIXED_ROLES, assignments };
};

export const deleteRole = async (role) => {
  if (!FIXED_ROLES.includes(role)) throw new Error('Invalid role');
  if (role === 'owner') throw new Error('Cannot delete owner role');
  // Check for active users with this role
  const { rows } = await query('SELECT COUNT(*)::int AS cnt FROM users WHERE role = $1', [role]);
  if (rows[0]?.cnt > 0) throw new Error(`Cannot delete: ${rows[0].cnt} user(s) still assigned to this role`);
  // Deactivate and clear permissions / module access
  await settings.setKey(`role.active.${role}`, 'false');
  await settings.setKey(`perms.${role}`, '[]');
  await settings.setKey(`modules.allow.${role}`, '[]');
  await settings.setKey(`subroutes.allow.${role}`, '[]');
  return { deleted: role };
};

export const setModulesForRole = async (role, data = {}) => {
  if (!FIXED_ROLES.includes(role)) throw new Error('Invalid role');
  const allowModules = Array.isArray(data.allowModules) ? data.allowModules : [];
  const allowSubroutes = Array.isArray(data.allowSubroutes) ? data.allowSubroutes : [];
  await settings.setKey(`modules.allow.${role}`, JSON.stringify(allowModules));
  await settings.setKey(`subroutes.allow.${role}`, JSON.stringify(allowSubroutes));
  return { role, allowModules, allowSubroutes };
};
