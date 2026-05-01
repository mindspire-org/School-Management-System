import { http } from '../http';

export const login = async ({ email, username, password, ownerKey }) => {
  const payload = { password };
  if (username) payload.username = username;
  else payload.email = email;
  if (ownerKey) payload.ownerKey = ownerKey;
  return http.post('/auth/login', payload);
};

export const register = async ({ email, password, name, role, campusId }) => {
  return http.post('/auth/register', { email, password, name, role, campusId });
};

export const status = async () => {
  return http.get('/auth/status');
};

export const logout = async () => {
  return http.post('/auth/logout');
};

export const refresh = async () => {
  return http.post('/auth/refresh');
};

// Admin only: list all users with roles
export const getUsers = async (params) => {
  return http.get('/auth/users', { params });
};

export const updateUser = (id, data) => http.put(`/auth/users/${id}`, data);
export const deleteUser = (id) => http.delete(`/auth/users/${id}`);

export const profile = async () => {
  return http.get('/auth/profile');
};

export const profileSafe = async (options = {}) => {
  return http.get('/auth/profile', { ...options, skipUnauthorizedHandler: true });
};

// Admin only: backfill user accounts from domain tables by role
export const backfillUsers = async ({ role }) => {
  return http.post('/auth/backfill-users', { role });
};
