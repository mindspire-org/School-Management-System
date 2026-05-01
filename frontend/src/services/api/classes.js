import { http } from '../http';

export const list = (params, options) => http.get('/classes', { params, ...(options || {}) });
export const getById = (id, options) => http.get(`/classes/${id}`, options);
export const create = (data, options) => http.post('/classes', data, options);
export const update = (id, data, options) => http.put(`/classes/${id}`, data, options);
export const remove = (id, options) => http.delete(`/classes/${id}`, options);
export const getSubjects = (id, options) => http.get(`/classes/${id}/subjects`, options);
export const upsertSubjects = (id, items, options) => http.post(`/classes/${id}/subjects`, items, options);
export const listSubjectsByClass = (params, options) => http.get('/classes/subjects/by-class', { params, ...(options || {}) });
