import { http } from '../http';

export const list = (params) => http.get('/students', { params });
export const getById = (id) => http.get(`/students/${id}`);
export const create = (data) => http.post('/students', data);
export const update = (id, data) => http.put(`/students/${id}`, data);
export const remove = (id) => http.delete(`/students/${id}`);

// Attendance
export const listAttendance = (id, params) => http.get(`/students/${id}/attendance`, { params });
export const addAttendance = (id, data) => http.post(`/students/${id}/attendance`, data);
export const updateAttendance = (id, attendanceId, data) => http.put(`/students/${id}/attendance/${attendanceId}`, data);
export const removeAttendance = (id, attendanceId) => http.delete(`/students/${id}/attendance/${attendanceId}`);

// Performance
export const getPerformance = (id) => http.get(`/students/${id}/performance`);

// Fees
export const getFees = (id) => http.get(`/students/${id}/fees`);
export const recordPayment = (id, data) => http.post(`/students/${id}/fees/payments`, data);
export const createInvoice = (id, data) => http.post(`/students/${id}/fees/invoices`, data);
export const updateInvoice = (id, invoiceId, data) => http.put(`/students/${id}/fees/invoices/${invoiceId}`, data);

// Transport
export const getTransport = (id) => http.get(`/students/${id}/transport`);
export const updateTransport = (id, data) => http.put(`/students/${id}/transport`, data);
