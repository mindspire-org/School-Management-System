import { http } from '../http';

export const list = (params) => http.get('/shared-content', { params });
export const getById = (id) => http.get(`/shared-content/${id}`);
