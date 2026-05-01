import { http } from '../http';

export const list = (params) => http.get('/exams', { params });
export const getById = (id) => http.get(`/exams/${id}`);
export const create = (data) => http.post('/exams', data);
export const update = (id, data) => http.put(`/exams/${id}`, data);
export const remove = (id) => http.delete(`/exams/${id}`);
