import { http } from '../http';

export const list = (params) => http.get('/classes', { params });
export const getById = (id) => http.get(`/classes/${id}`);
export const create = (data) => http.post('/classes', data);
export const update = (id, data) => http.put(`/classes/${id}`, data);
export const remove = (id) => http.delete(`/classes/${id}`);
export const getSubjects = (id) => http.get(`/classes/${id}/subjects`);
export const upsertSubjects = (id, items) => http.post(`/classes/${id}/subjects`, items);
export const listSubjectsByClass = (params) => http.get('/classes/subjects/by-class', { params });
