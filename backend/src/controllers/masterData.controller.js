import * as service from '../services/masterData.service.js';

const resolveCampusId = (req) => {
    const headerCampusId =
        req.headers?.['x-campus-id'] ??
        req.headers?.['x-campusid'] ??
        req.headers?.['campus-id'] ??
        req.headers?.['campusid'];
    const id = headerCampusId ?? req.user?.campusId;
    const num = Number(id);
    return Number.isFinite(num) && num > 0 ? num : null;
};

// --- Subjects ---
export const getSubjects = async (req, res, next) => {
    try {
        const data = await service.getSubjects(resolveCampusId(req));
        res.json(data);
    } catch (err) { next(err); }
};

export const createSubject = async (req, res, next) => {
    try {
        const data = await service.createSubject(req.body, resolveCampusId(req));
        res.json(data);
    } catch (err) { next(err); }
};

export const updateSubject = async (req, res, next) => {
    try {
        const data = await service.updateSubject(req.params.id, req.body);
        res.json(data);
    } catch (err) { next(err); }
};

export const deleteSubject = async (req, res, next) => {
    try {
        const data = await service.deleteSubject(req.params.id);
        res.json(data);
    } catch (err) { next(err); }
};

// --- Designations ---
export const getDesignations = async (req, res, next) => {
    try {
        const data = await service.getDesignations(resolveCampusId(req));
        res.json(data);
    } catch (err) { next(err); }
};

export const createDesignation = async (req, res, next) => {
    try {
        const data = await service.createDesignation(req.body, resolveCampusId(req));
        res.json(data);
    } catch (err) { next(err); }
};

export const updateDesignation = async (req, res, next) => {
    try {
        const data = await service.updateDesignation(req.params.id, req.body);
        res.json(data);
    } catch (err) { next(err); }
};

export const deleteDesignation = async (req, res, next) => {
    try {
        const data = await service.deleteDesignation(req.params.id);
        res.json(data);
    } catch (err) { next(err); }
};

// --- Fee Rules ---
export const getFeeRules = async (req, res, next) => {
    try {
        const data = await service.getFeeRules(resolveCampusId(req));
        res.json(data);
    } catch (err) { next(err); }
};

export const createFeeRule = async (req, res, next) => {
    try {
        const data = await service.createFeeRule(req.body, resolveCampusId(req));
        res.json(data);
    } catch (err) { next(err); }
};

export const updateFeeRule = async (req, res, next) => {
    try {
        const data = await service.updateFeeRule(req.params.id, req.body);
        res.json(data);
    } catch (err) { next(err); }
};

export const deleteFeeRule = async (req, res, next) => {
    try {
        const data = await service.deleteFeeRule(req.params.id);
        res.json(data);
    } catch (err) { next(err); }
};

// --- Departments ---
export const getDepartments = async (req, res, next) => {
    try {
        const data = await service.getDepartments(resolveCampusId(req));
        res.json(data);
    } catch (err) { next(err); }
};

export const createDepartment = async (req, res, next) => {
    try {
        const data = await service.createDepartment(req.body, resolveCampusId(req));
        res.json(data);
    } catch (err) { next(err); }
};

export const updateDepartment = async (req, res, next) => {
    try {
        const data = await service.updateDepartment(req.params.id, req.body);
        res.json(data);
    } catch (err) { next(err); }
};

export const deleteDepartment = async (req, res, next) => {
    try {
        const data = await service.deleteDepartment(req.params.id);
        res.json(data);
    } catch (err) { next(err); }
};
