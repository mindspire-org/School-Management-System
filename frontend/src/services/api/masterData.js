import { http } from '../http';

// Subjects
export const getSubjects = () => http.get('/master-data/subjects');
export const createSubject = (data) => http.post('/master-data/subjects', data);
export const updateSubject = (id, data) => http.put(`/master-data/subjects/${id}`, data);
export const deleteSubject = (id) => http.delete(`/master-data/subjects/${id}`);

// Designations
export const getDesignations = () => http.get('/master-data/designations');
export const createDesignation = (data) => http.post('/master-data/designations', data);
export const updateDesignation = (id, data) => http.put(`/master-data/designations/${id}`, data);
export const deleteDesignation = (id) => http.delete(`/master-data/designations/${id}`);

// Fee Rules
export const getFeeRules = () => http.get('/master-data/fee-rules');
export const createFeeRule = (data) => http.post('/master-data/fee-rules', data);
export const updateFeeRule = (id, data) => http.put(`/master-data/fee-rules/${id}`, data);
export const deleteFeeRule = (id) => http.delete(`/master-data/fee-rules/${id}`);

// Departments
export const getDepartments = () => http.get('/master-data/departments');
export const createDepartment = (data) => http.post('/master-data/departments', data);
export const updateDepartment = (id, data) => http.put(`/master-data/departments/${id}`, data);
export const deleteDepartment = (id) => http.delete(`/master-data/departments/${id}`);

export default {
    getSubjects, createSubject, updateSubject, deleteSubject,
    getDesignations, createDesignation, updateDesignation, deleteDesignation,
    getFeeRules, createFeeRule, updateFeeRule, deleteFeeRule,
    getDepartments, createDepartment, updateDepartment, deleteDepartment
};
