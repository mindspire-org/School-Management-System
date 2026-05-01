import { http } from '../http';

export const list = (params) => http.get('/alerts', { params });
export const create = (data) => http.post('/alerts', data);
export const markRead = (ids) => http.post('/alerts/mark-read', { ids });
export const resolve = (ids) => http.post('/alerts/resolve', { ids });
export const listMine = (params) => http.get('/alerts/mine', { params });
export const recipients = (params) => http.get('/alerts/recipients', { params });
