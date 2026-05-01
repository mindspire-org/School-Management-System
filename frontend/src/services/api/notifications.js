import { http } from '../http';

export const list = (params) => http.get('/notifications', { params });
export const getById = (id) => http.get(`/notifications/${id}`);
export const markRead = (id) => http.put(`/notifications/${id}/read`);
