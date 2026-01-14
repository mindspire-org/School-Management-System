import { http } from '../http';

export const list = (params) => http.get('/rfid/logs', { params });
export const getById = (id) => http.get(`/rfid/logs/${id}`);
export const create = (data) => http.post('/rfid/logs', data);
export const update = (id, data) => http.put(`/rfid/logs/${id}`, data);
export const remove = (id) => http.delete(`/rfid/logs/${id}`);
