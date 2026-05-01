import { http } from '../http';

export const overview = () => http.get('/reports/overview');
export const attendanceSummary = (params) => http.get('/reports/attendance-summary', { params });
export const financeSummary = (params) => http.get('/reports/finance-summary', { params });
export const financeByClass = (params) => http.get('/reports/finance-by-class', { params });
export const financeByHead = (params) => http.get('/reports/finance-by-head', { params });
export const financePaymentMethods = (params) => http.get('/reports/finance-payment-methods', { params });
export const financeOverdueBuckets = (params) => http.get('/reports/finance-overdue-buckets', { params });
export const examPerformance = (params) => http.get('/reports/exam-performance', { params });
export const attendanceByClass = (params) => http.get('/reports/attendance-by-class', { params });
export const attendanceHeatmap = (params) => http.get('/reports/attendance-heatmap', { params });
