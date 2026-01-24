import { http } from '../http';

export const login = async ({ email, password }) => {
  return http.post('/auth/login', { email, password });
};

export const register = async ({ email, password, name, role }) => {
  return http.post('/auth/register', { email, password, name, role });
};

export const logout = async () => {
  return http.post('/auth/logout');
};

export const refresh = async () => {
  return http.post('/auth/refresh');
};

export const profile = async () => {
  return http.get('/auth/profile');
};
