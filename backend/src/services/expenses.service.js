import { pool } from '../config/db.js';

export const listExpenses = async ({ search, category, vendor, status, from, to, page = 1, pageSize = 10, campusId }) => {
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (search) {
        query += ` AND (description ILIKE $${paramIndex} OR vendor ILIKE $${paramIndex})`;
        values.push(`%${search}%`);
        paramIndex++;
    }

    if (category && category !== 'all') {
        query += ` AND category = $${paramIndex}`;
        values.push(category);
        paramIndex++;
    }

    if (vendor && vendor !== 'all') {
        query += ` AND vendor = $${paramIndex}`;
        values.push(vendor);
        paramIndex++;
    }

    if (status && status !== 'all') {
        query += ` AND status = $${paramIndex}`;
        values.push(status);
        paramIndex++;
    }

    if (from) {
        query += ` AND date >= $${paramIndex}`;
        values.push(from);
        paramIndex++;
    }

    if (to) {
        query += ` AND date <= $${paramIndex}`;
        values.push(to);
        paramIndex++;
    }

    if (campusId) {
        query += ` AND campus_id = $${paramIndex}`;
        values.push(campusId);
        paramIndex++;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM (${query}) AS temp`, values);
    const total = parseInt(countRes.rows[0].count);

    query += ` ORDER BY date DESC, id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(pageSize, (page - 1) * pageSize);

    const res = await pool.query(query, values);
    return { items: res.rows, total };
};

export const getExpenseStats = async ({ campusId } = {}) => {
    const query = `
    SELECT
      COALESCE(SUM(amount), 0) as total,
      COUNT(*) FILTER (WHERE status = 'Pending') as pending,
      COUNT(*) FILTER (WHERE status = 'Approved') as approved,
      COALESCE(SUM(amount) FILTER (WHERE status = 'Paid'), 0) as paid
    FROM expenses
    WHERE ($1::int IS NULL OR campus_id = $1::int)
  `;
    const res = await pool.query(query, [campusId || null]);
    return {
        total: Number(res.rows[0].total),
        pending: Number(res.rows[0].pending),
        approved: Number(res.rows[0].approved),
        paid: Number(res.rows[0].paid)
    };
};

export const getExpenseById = async (id) => {
    const res = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    return res.rows[0];
};

export const createExpense = async (data, userId) => {
    const { date, category, vendor, description, amount, status, receipt, note, campusId } = data;
    const initialLog = JSON.stringify([{ date: new Date().toISOString().slice(0, 10), event: 'Created' }]);

    const res = await pool.query(
        `INSERT INTO expenses 
     (date, category, vendor, description, amount, status, receipt, note, logs, created_by, campus_id) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
     RETURNING *`,
        [date, category, vendor, description, amount, status || 'Pending', receipt, note, initialLog, userId, campusId]
    );
    return res.rows[0];
};

export const updateExpense = async (id, data) => {
    const { date, category, vendor, description, amount, status, receipt, note } = data;

    // First get existing to append log if status changed
    const existing = await getExpenseById(id);
    if (!existing) return null;

    let logs = existing.logs || [];
    if (status && status !== existing.status) {
        logs.push({ date: new Date().toISOString().slice(0, 10), event: status });
    } else {
        logs.push({ date: new Date().toISOString().slice(0, 10), event: 'Edited' });
    }

    const res = await pool.query(
        `UPDATE expenses SET 
     date = COALESCE($1, date), 
     category = COALESCE($2, category), 
     vendor = COALESCE($3, vendor), 
     description = COALESCE($4, description), 
     amount = COALESCE($5, amount), 
     status = COALESCE($6, status), 
     receipt = COALESCE($7, receipt), 
     note = COALESCE($8, note), 
     logs = $9,
     updated_at = NOW()
     WHERE id = $10 
     RETURNING *`,
        [date, category, vendor, description, amount, status, receipt, note, JSON.stringify(logs), id]
    );
    return res.rows[0];
};

export const deleteExpense = async (id) => {
    await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    return true;
};
