import { http } from '../http';

export const bulkUpsert = (data) => http.post('/marks/bulk-upsert', data);
export const entries = (params) => http.get('/marks/entries', { params });
export const getResultCard = (params) => http.get('/marks/result-card', { params });
