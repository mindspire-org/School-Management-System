import pg from 'pg';
import { loadEnv } from './env.js';
import { URL } from 'url';

loadEnv();

const { Pool, Client } = pg;

const defaultSchool = 'postgres://postgres:12345@localhost:5432/school_db';
const defaultPostgres = 'postgres://postgres:12345@localhost:5432/postgres';

const CONNECT_TIMEOUT_MS = Number(process.env.PG_CONNECT_TIMEOUT_MS) || 5000;

const normalizeLocalhost = (rawUrl) => {
  try {
    const u = new URL(rawUrl);
    if (u.hostname === 'localhost') u.hostname = '127.0.0.1';
    return u.toString();
  } catch (_) {
    return rawUrl;
  }
};

const toSSL = (url) => {
  try {
    const u = new URL(url);
    const sslEnabled =
      u.searchParams.get('ssl') === 'true' ||
      u.searchParams.get('sslmode') === 'require' ||
      process.env.PGSSL === 'true';
    return sslEnabled ? { rejectUnauthorized: false } : undefined;
  } catch (_) {
    return undefined;
  }
};

const toAdminUrl = (rawUrl) => {
  try {
    const u = new URL(rawUrl);
    u.pathname = '/postgres';
    return u.toString();
  } catch (_) {
    return defaultPostgres;
  }
};

async function ensureDatabaseExists({ adminUrl, dbName }) {
  const ssl = toSSL(adminUrl);
  const client = new Client({ connectionString: adminUrl, ssl, connectionTimeoutMillis: CONNECT_TIMEOUT_MS });
  try {
    await client.connect();
    const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (exists?.rowCount) return true;
    const safeName = String(dbName || '').replace(/"/g, '""');
    await client.query(`CREATE DATABASE "${safeName}"`);
    return true;
  } catch (_) {
    return false;
  } finally {
    try { await client.end(); } catch (_) { }
  }
}

const envUrl = process.env.DATABASE_URL;
const baseUrl = normalizeLocalhost(envUrl || defaultSchool);

const detected = { url: baseUrl, ssl: toSSL(baseUrl) };

try {
  const u = new URL(detected.url);
  const dbName = (u.pathname || '').replace(/^\//, '');
  const host = u.hostname;
  const port = u.port || '5432';
  console.log(`[db] Using database ${dbName} at ${host}:${port}`);
} catch (_) {}

export const connectionDetails = detected;

export async function ensureAppDatabaseExists() {
  const enabled = String(process.env.SMS_AUTO_CREATE_DB || 'true').toLowerCase() !== 'false';
  if (!enabled) return false;
  try {
    const u = new URL(detected.url);
    const dbName = (u.pathname || '').replace(/^\//, '') || 'school_db';
    const adminUrl = normalizeLocalhost(toAdminUrl(detected.url));
    return await ensureDatabaseExists({ adminUrl, dbName });
  } catch (_) {
    return false;
  }
}

export const pool = new Pool({
  connectionString: detected.url,
  ssl: detected.ssl,
  connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
});

export const query = (text, params) => pool.query(text, params);

export default { pool, query, connectionDetails };
