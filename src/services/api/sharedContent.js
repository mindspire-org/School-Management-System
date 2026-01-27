import { http } from '../http';

export const list = (params) => http.get('/shared-content', { params });
export const getById = (id) => http.get(`/shared-content/${id}`);

// Teacher-only actions
export const create = (data) => http.post('/shared-content', data);
export const update = (id, data) => http.put(`/shared-content/${id}`, data);
export const publish = (id) => http.put(`/shared-content/${id}/publish`);
export const unpublish = (id) => http.put(`/shared-content/${id}/unpublish`);
export const remove = (id) => http.delete(`/shared-content/${id}`);
