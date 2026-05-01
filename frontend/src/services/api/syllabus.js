import { http } from '../http';

export const list = (params) => http.get('/syllabus', { params });
export const getById = (id) => http.get(`/syllabus/${id}`);
export const create = (data) => http.post('/syllabus', data);
export const update = (id, data) => http.patch(`/syllabus/${id}`, data);
export const remove = (id) => http.delete(`/syllabus/${id}`);
