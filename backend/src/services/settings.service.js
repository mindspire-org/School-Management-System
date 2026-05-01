import { query } from '../config/db.js';

const ensureSettingsTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
};

const withSettingsTable = async (fn) => {
  try {
    return await fn();
  } catch (e) {
    if (e && e.code === '42P01') {
      await ensureSettingsTable();
      return await fn();
    }
    throw e;
  }
};

export const list = async () => {
  return await withSettingsTable(async () => {
    const { rows } = await query('SELECT key, value, updated_at AS "updatedAt" FROM settings ORDER BY key ASC');
    return rows;
  });
};

export const getByKey = async (key) => {
  return await withSettingsTable(async () => {
    const { rows } = await query('SELECT key, value, updated_at AS "updatedAt" FROM settings WHERE key = $1', [key]);
    return rows[0] || null;
  });
};

export const setKey = async (key, value) => {
  return await withSettingsTable(async () => {
    const { rows } = await query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ($1,$2,NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
       RETURNING key, value, updated_at AS "updatedAt"`,
      [key, String(value)]
    );
    return rows[0];
  });
};

export const removeKey = async (key) => {
  return await withSettingsTable(async () => {
    await query('DELETE FROM settings WHERE key = $1', [key]);
    return true;
  });
};
