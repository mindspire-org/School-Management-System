import { query } from '../config/db.js';

// --- Subjects ---
export const getSubjects = async (campusId) => {
    const whereSql = campusId ? `WHERE campus_id = ${Number(campusId)} OR is_shared = true` : '';
    const { rows } = await query(`SELECT * FROM subjects ${whereSql} ORDER BY name ASC`);
    return rows;
};

export const createSubject = async (data, campusId) => {
    const { name, code, category, isShared } = data;
    const { rows } = await query(
        `INSERT INTO subjects (name, code, category, campus_id, is_shared) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, code, category, campusId, isShared || false]
    );
    return rows[0];
};

export const updateSubject = async (id, data) => {
    const { name, code, category, isShared } = data;
    const { rows } = await query(
        `UPDATE subjects SET name = $1, code = $2, category = $3, is_shared = COALESCE($5, is_shared) WHERE id = $4 RETURNING *`,
        [name, code, category, id, isShared]
    );
    return rows[0];
};

export const deleteSubject = async (id) => {
    const { rows } = await query(`DELETE FROM subjects WHERE id = $1 RETURNING id`, [id]);
    return rows[0];
};

// --- Designations ---
export const getDesignations = async (campusId) => {
    const whereSql = campusId ? `WHERE campus_id = ${Number(campusId)} OR is_shared = true` : '';
    const { rows } = await query(`SELECT * FROM designations ${whereSql} ORDER BY title ASC`);
    return rows;
};

export const createDesignation = async (data, campusId) => {
    const { title, department, isShared } = data;
    const { rows } = await query(
        `INSERT INTO designations (title, department, campus_id, is_shared) VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, department, campusId, isShared || false]
    );
    return rows[0];
};

export const updateDesignation = async (id, data) => {
    const { title, department, isShared } = data;
    const { rows } = await query(
        `UPDATE designations SET title = $1, department = $2, is_shared = COALESCE($4, is_shared) WHERE id = $3 RETURNING *`,
        [title, department, id, isShared]
    );
    return rows[0];
};

export const deleteDesignation = async (id) => {
    const { rows } = await query(`DELETE FROM designations WHERE id = $1 RETURNING id`, [id]);
    return rows[0];
};

// --- Fee Rules ---
export const getFeeRules = async (campusId) => {
    const whereSql = campusId ? `WHERE campus_id = ${Number(campusId)}` : '';
    const { rows } = await query(`SELECT * FROM fee_structures ${whereSql} ORDER BY created_at DESC`);
    return rows;
};

export const createFeeRule = async (data, campusId) => {
    const { fee_type, amount, frequency, class_id, isShared } = data;
    // Note: Fee Structures might be campus specific usually, but supporting shared if needed
    const { rows } = await query(
        `INSERT INTO fee_structures (fee_type, amount, frequency, class_id, campus_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [fee_type, amount, frequency, class_id, campusId]
    );
    return rows[0];
};

export const updateFeeRule = async (id, data) => {
    const { fee_type, amount, frequency, class_id } = data;
    const { rows } = await query(
        `UPDATE fee_structures SET fee_type = $1, amount = $2, frequency = $3, class_id = $4 WHERE id = $5 RETURNING *`,
        [fee_type, amount, frequency, class_id, id]
    );
    return rows[0];
};

export const deleteFeeRule = async (id) => {
    const { rows } = await query(`DELETE FROM fee_structures WHERE id = $1 RETURNING id`, [id]);
    return rows[0];
};

export default {
    getSubjects, createSubject, updateSubject, deleteSubject,
    getDesignations, createDesignation, updateDesignation, deleteDesignation,
    getFeeRules, createFeeRule, updateFeeRule, deleteFeeRule
};
