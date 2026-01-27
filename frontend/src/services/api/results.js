import { http } from '../http';

export const list = (params) => http.get('/results', { params });
export const getById = (id) => http.get(`/results/${id}`);
