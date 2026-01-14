import { http } from '../http';

// Admin dashboard overview (students, teachers, buses, attendance, alerts)
export const getOverview = () => http.get('/dashboard/overview');
export const getAttendanceWeekly = () => http.get('/dashboard/attendance-weekly');
export const getFeesMonthly = () => http.get('/dashboard/fees-monthly');
