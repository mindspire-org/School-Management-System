import { http } from '../http';

export const list = (params) => http.get('/campuses', { params });
export const getById = (id) => http.get(`/campuses/${id}`);
export const create = (data) => http.post('/campuses', data);
export const update = (id, data) => http.put(`/campuses/${id}`, data);
export const remove = (id) => http.delete(`/campuses/${id}`);
