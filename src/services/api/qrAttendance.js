import { http } from '../http';

export const list = (params) => http.get('/events-certificates/qr-attendance', { params });
export const getById = (id) => http.get(`/events-certificates/qr-attendance/${id}`);
export const create = (data) => http.post('/events-certificates/qr-attendance', data);
export const update = (id, data) => http.put(`/events-certificates/qr-attendance/${id}`, data);
export const remove = (id) => http.delete(`/events-certificates/qr-attendance/${id}`);

export const createSession = (data) => http.post('/events-certificates/qr-attendance-sessions', data);
export const scanSession = (data) => http.post('/events-certificates/qr-attendance/scan', data);
export const markPerson = (data) => http.post('/events-certificates/qr-attendance/mark-person', data);
