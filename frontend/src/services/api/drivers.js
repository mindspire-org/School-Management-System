import { http } from '../http';

export const list = (params) => http.get('/drivers', { params });
export const getById = (id) => http.get(`/drivers/${id}`);
export const create = (data) => http.post('/drivers', data);
export const update = (id, data) => http.put(`/drivers/${id}`, data);
export const remove = (id, params) => http.delete(`/drivers/${id}`, { params });

export const payroll = (id, params) => http.get(`/drivers/${id}/payroll`, { params });
export const createPayroll = (id, data) => http.post(`/drivers/${id}/payroll`, data);
export const updatePayrollStatus = (driverId, payrollId, data) => http.patch(`/drivers/${driverId}/payroll/${payrollId}/status`, data);
export const getDashboardStats = (id) => http.get(`/drivers/${id}/dashboard-stats`);
