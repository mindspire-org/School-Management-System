import { query } from '../config/db.js';

export const list = async ({ page = 1, pageSize = 50, q }) => {
    const offset = (page - 1) * pageSize;
    const params = [];
    const where = [];

    if (q) {
        params.push(`%${q.toLowerCase()}%`);
        where.push(`LOWER(name) LIKE $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const { rows: countRows } = await query(
        `SELECT COUNT(*)::int AS count FROM campuses ${whereSql}`,
        params
    );
    const total = countRows[0]?.count || 0;

    const { rows } = await query(
        `SELECT id, name, address, phone, email, capacity, status, created_at AS "createdAt"
     FROM campuses
     ${whereSql}
     ORDER BY name ASC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pageSize, offset]
    );

    return { rows, total, page, pageSize };
};

export const getById = async (id) => {
    const { rows } = await query('SELECT id, name, address, phone, email, capacity, status, created_at AS "createdAt" FROM campuses WHERE id = $1', [id]);
    return rows[0] || null;
};

export const create = async ({ name, address, phone, email, capacity, status }) => {
    const { rows } = await query(
        'INSERT INTO campuses (name, address, phone, email, capacity, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, address, phone, email, capacity, status, created_at AS "createdAt"',
        [name, address || null, phone || null, email || null, capacity ?? null, status || 'active']
    );
    return rows[0];
};

export const update = async (id, { name, address, phone, email, capacity, status }) => {
    const { rows } = await query(
        'UPDATE campuses SET name = $1, address = $2, phone = $3, email = $4, capacity = $5, status = $6 WHERE id = $7 RETURNING id, name, address, phone, email, capacity, status, created_at AS "createdAt"',
        [name, address || null, phone || null, email || null, capacity ?? null, status || 'active', id]
    );
    return rows[0];
};

export const remove = async (id) => {
    const { rowCount } = await query('DELETE FROM campuses WHERE id = $1', [id]);
    return rowCount > 0;
};
