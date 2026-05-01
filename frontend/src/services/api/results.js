import { http } from '../http';

export const list = (params) => http.get('/results', { params });
export const getById = (id) => http.get(`/results/${id}`);
export const create = (data) => http.post('/results', data);
export const update = (id, data) => http.put(`/results/${id}`, data);
export const remove = (id) => http.delete(`/results/${id}`);
export const bulkCreate = (items) => http.post('/results/bulk', items);
