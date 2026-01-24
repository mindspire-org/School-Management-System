import { http } from '../http';

export const list = (params) => http.get('/assignments', { params });
export const getById = (id) => http.get(`/assignments/${id}`);
export const create = (data) => http.post('/assignments', data);
export const update = (id, data) => http.put(`/assignments/${id}`, data);
export const remove = (id) => http.delete(`/assignments/${id}`);
export const submitWork = (assignmentId, data) => http.post(`/assignments/${assignmentId}/submit`, data);
