import { http } from '../http';

export const list = (params) => http.get('/teachers/subjects', { params });
export const create = (data) => http.post('/teachers/subjects', data);
export const update = (id, data) => http.patch(`/teachers/subjects/${id}`, data);
export const remove = (id) => http.delete(`/teachers/subjects/${id}`);
export const listAssignments = (params) => http.get('/teachers/subjects/assignments', { params });
export const assign = (data) => http.post('/teachers/subjects/assignments', data);
export const updateAssignment = (id, data) => http.patch(`/teachers/subjects/assignments/${id}`, data);
export const removeAssignment = (id) => http.delete(`/teachers/subjects/assignments/${id}`);
