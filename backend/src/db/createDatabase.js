import pg from 'pg';
import { URL } from 'url';
import { loadEnv } from '../config/env.js';

loadEnv();

const { Client } = pg;

function parseDatabaseUrl() {
  const urlStr = process.env.DATABASE_URL || 'postgres://postgres:12345@localhost:5432/postgres';
  const u = new URL(urlStr);
  const dbName = (u.pathname || '').replace(/^\//, '') || 'postgres';
  const host = u.hostname || 'localhost';
  const port = u.port ? parseInt(u.port, 10) : 5432;
  const user = decodeURIComponent(u.username || 'postgres');
  const password = decodeURIComponent(u.password || '');

  // Basic SSL detection (for cloud DBs)
  const sslEnabled =
    u.searchParams.get('ssl') === 'true' ||
    u.searchParams.get('sslmode') === 'require' ||
    process.env.PGSSL === 'true';

  const ssl = sslEnabled ? { rejectUnauthorized: false } : undefined;

  return { host, port, user, password, dbName, ssl };
}

async function ensureDatabaseExists() {
  const cfg = parseDatabaseUrl();

  const admin = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: 'postgres',
    ssl: cfg.ssl,
  });

  try {
    await admin.connect();
    const res = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [cfg.dbName]);

    if (res.rowCount === 0) {
      const dbIdent = cfg.dbName.replace(/"/g, '""');
      console.log(`Creating database "${cfg.dbName}" ...`);
      await admin.query(`CREATE DATABASE "${dbIdent}"`);
      console.log('Database created successfully.');
    } else {
      console.log(`Database "${cfg.dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Failed to ensure database exists:', err);
    process.exitCode = 1;
  } finally {
    await admin.end();
  }
}

ensureDatabaseExists();
