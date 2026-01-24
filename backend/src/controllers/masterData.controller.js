import * as service from '../services/masterData.service.js';

// --- Subjects ---
export const getSubjects = async (req, res, next) => {
    try {
        const data = await service.getSubjects(req.user?.campusId);
        res.json(data);
    } catch (err) { next(err); }
};

export const createSubject = async (req, res, next) => {
    try {
        const data = await service.createSubject(req.body, req.user?.campusId);
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
        const data = await service.getDesignations(req.user?.campusId);
        res.json(data);
    } catch (err) { next(err); }
};

export const createDesignation = async (req, res, next) => {
    try {
        const data = await service.createDesignation(req.body, req.user?.campusId);
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
        const data = await service.getFeeRules(req.user?.campusId);
        res.json(data);
    } catch (err) { next(err); }
};

export const createFeeRule = async (req, res, next) => {
    try {
        const data = await service.createFeeRule(req.body, req.user?.campusId);
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
