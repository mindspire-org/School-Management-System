import { http } from '../http';

export const list = (params) => http.get('/parents', { params });
export const getById = (id) => http.get(`/parents/${id}`);
export const create = (data) => http.post('/parents', data);
export const update = (id, data) => http.put(`/parents/${id}`, data);
export const inform = (id, data) => http.post(`/parents/${id}/inform`, data);
export const remove = (id) => http.delete(`/parents/${id}`);
