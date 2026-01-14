import { http } from '../http';

export const list = () => http.get('/grading');
export const getDefault = () => http.get('/grading/default');
export const getById = (id) => http.get(`/grading/${id}`);
export const create = (data) => http.post('/grading', data);
export const update = (id, data) => http.put(`/grading/${id}`, data);
export const setDefault = (id) => http.post(`/grading/${id}/default`);
export const compute = (data) => http.post('/grading/compute', data);
