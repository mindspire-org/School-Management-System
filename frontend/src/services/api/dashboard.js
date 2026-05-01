import { http } from '../http';

export const getOverview = () => http.get('/dashboard/overview');
export const getAttendanceWeekly = (params) => http.get('/dashboard/attendance-weekly', { params });
export const getFeesMonthly = (params) => http.get('/dashboard/fees-monthly', { params });

export default {
    getOverview,
    getAttendanceWeekly,
    getFeesMonthly
};
