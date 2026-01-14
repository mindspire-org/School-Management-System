import { http } from '../http';

export const getRoles = () => http.get('/rbac/roles');
export const setRoleActive = (role, active) => http.put(`/rbac/roles/${encodeURIComponent(role)}/active`, { active });

export const getPermissions = () => http.get('/rbac/permissions');
export const setPermissions = (role, perms) => http.put(`/rbac/permissions/${encodeURIComponent(role)}`, { perms });

// Module-level access
export const getModules = () => http.get('/rbac/modules');
export const setModules = (role, data) => http.put(`/rbac/modules/${encodeURIComponent(role)}`, data);
export const getMyModules = () => http.get('/rbac/my-modules');
