import pg from 'pg';
import { loadEnv } from './env.js';
import { URL } from 'url';

loadEnv();

const { Pool, Client } = pg;

const defaultSchool = 'postgres://postgres:12345@localhost:5432/school_db';
const defaultPostgres = 'postgres://postgres:12345@localhost:5432/postgres';

async function testDb(url) {
  let ssl;
  try {
    const u = new URL(url);
    const sslEnabled =
      u.searchParams.get('ssl') === 'true' ||
      u.searchParams.get('sslmode') === 'require' ||
      process.env.PGSSL === 'true';
    ssl = sslEnabled ? { rejectUnauthorized: false } : undefined;
  } catch (_) {
    ssl = undefined;
  }

  const client = new Client({ connectionString: url, ssl });
  try {
    await client.connect();
    const r = await client.query("SELECT to_regclass('public.users') AS users, to_regclass('public.students') AS students, to_regclass('public.settings') AS settings");
    const hasTables = !!(r?.rows?.[0]?.users || r?.rows?.[0]?.students || r?.rows?.[0]?.settings);
    return { ok: true, hasTables, ssl };
  } catch (_) {
    return { ok: false, hasTables: false, ssl: undefined };
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

async function detectConnectionString() {
  const envUrl = process.env.DATABASE_URL;

  // Evaluate school_db and postgres
  const tSchool = await testDb(defaultSchool);
  const tPost = await testDb(defaultPostgres);

  // 1) If DATABASE_URL is provided, honor it only if it targets school_db OR it has app tables
  if (envUrl) {
    try {
      const u = new URL(envUrl);
      const dbName = (u.pathname || '').replace(/^\//, '');
      const tEnv = await testDb(envUrl);
      if (dbName === 'school_db' && tEnv.ok) return { url: envUrl, ssl: tEnv.ssl };
      if (tEnv.ok && tEnv.hasTables) return { url: envUrl, ssl: tEnv.ssl };
      // If env connects but lacks tables and school_db is available, prefer school_db
      if (tSchool.ok) return { url: defaultSchool, ssl: tSchool.ssl };
      if (tPost.ok && tPost.hasTables) return { url: defaultPostgres, ssl: tPost.ssl };
      if (tEnv.ok) return { url: envUrl, ssl: tEnv.ssl };
    } catch (_) {
      // ignore parse errors, fall through
    }
  }

  // 2) Prefer existing school_db with app tables
  if (tSchool.ok && tSchool.hasTables) return { url: defaultSchool, ssl: tSchool.ssl };

  // 3) Next prefer existing postgres with app tables
  if (tPost.ok && tPost.hasTables) return { url: defaultPostgres, ssl: tPost.ssl };

  // 4) If none have tables, prefer whichever connects: school_db first
  if (tSchool.ok) return { url: defaultSchool, ssl: tSchool.ssl };
  if (tPost.ok) return { url: defaultPostgres, ssl: tPost.ssl };

  // 5) Final fallback
  return { url: envUrl || defaultSchool, ssl: undefined };
}

const detected = await detectConnectionString();

export const pool = new Pool({ connectionString: detected.url, ssl: detected.ssl });

export const query = (text, params) => pool.query(text, params);

export default { pool, query };
