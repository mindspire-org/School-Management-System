import pg from 'pg';
import { loadEnv } from './env.js';
import { URL } from 'url';

loadEnv();

const { Pool, Client } = pg;

const defaultSchool = 'postgres://postgres:12345@localhost:5432/school_db';
const defaultPostgres = 'postgres://postgres:12345@localhost:5432/postgres';

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

const forceSchoolDbUrl = (rawUrl) => {
  try {
    const u = new URL(rawUrl);
    u.pathname = '/school_db';
    return u.toString();
  } catch (_) {
    return defaultSchool;
  }
};

const forcePostgresDbUrl = (rawUrl) => {
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
  const client = new Client({ connectionString: adminUrl, ssl });
  try {
    await client.connect();
    const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (exists?.rowCount) return true;
    await client.query(`CREATE DATABASE ${dbName}`);
    return true;
  } catch (_) {
    return false;
  } finally {
    try { await client.end(); } catch (_) { }
  }
}

// FORCE: Always use school_db
const envUrl = process.env.DATABASE_URL;
const baseUrl = envUrl || defaultSchool;
const schoolUrl = forceSchoolDbUrl(baseUrl);
const adminUrl = forcePostgresDbUrl(baseUrl);

// Best-effort: create school_db if it doesn't exist
await ensureDatabaseExists({ adminUrl, dbName: 'school_db' });

const detected = { url: schoolUrl, ssl: toSSL(schoolUrl) };

try {
  const u = new URL(detected.url);
  const dbName = (u.pathname || '').replace(/^\//, '');
  const host = u.hostname;
  const port = u.port || '5432';
  console.log(`[db] Using database ${dbName} at ${host}:${port}`);
} catch (_) {}

export const connectionDetails = detected;

export const pool = new Pool({ connectionString: detected.url, ssl: detected.ssl });

export const query = (text, params) => pool.query(text, params);

export default { pool, query, connectionDetails };
