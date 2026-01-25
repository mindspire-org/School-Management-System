import http from 'http';
import app from './app.js';
import { loadEnv } from './config/env.js';
import * as authService from './services/auth.service.js';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { pool } from './config/db.js';
import { ensureAuthSchema, ensureCampusSchema, ensureCardManagementSchema, ensureCertificatesSchema, ensureMasterDataSchema } from './db/autoMigrate.js';
import { initDb } from './models/index.js';

loadEnv();

// Use a stable default port for Electron packaging
const DEFAULT_PORT = 59201;
let port = Number(process.env.PORT) || DEFAULT_PORT;

async function ensureBaseSchema() {
  const { rows } = await pool.query("SELECT to_regclass('public.users') AS users, to_regclass('public.settings') AS settings");
  const hasUsers = !!rows?.[0]?.users;
  const hasSettings = !!rows?.[0]?.settings;
  if (hasUsers && hasSettings) return;

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    client.release();
  }
}

async function boot() {
  // Ensure base schema + auth + campus schema exists before starting server
  try {
    await ensureBaseSchema();
    await ensureAuthSchema();
    await ensureCampusSchema();
    await ensureCardManagementSchema();
    await ensureCertificatesSchema();
    await ensureMasterDataSchema();
  } catch (e) {
    try { console.error('Auto-migration failed:', e?.stack || e); } catch (_) {}
  }

  // Ensure Sequelize-managed module tables exist
  try {
    await initDb();
  } catch (e) {
    try { console.error('Sequelize init failed:', e?.stack || e); } catch (_) {}
  }

  // Seed or ensure Owner account exists BEFORE starting server to avoid race
  try {
    const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
    const ownerPassword = process.env.OWNER_PASSWORD || 'Qutaibah@123';
    const ownerName = process.env.OWNER_NAME || 'Mindspire Owner';
    await authService.ensureOwnerUser({ email: ownerEmail, password: ownerPassword, name: ownerName });
  } catch (_) {}

  const server = http.createServer(app);
  const start = (p) => {
    port = p;
    server.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  };
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      if (port !== DEFAULT_PORT) {
        console.warn(`Port ${port} in use. Falling back to ${DEFAULT_PORT} ...`);
        start(DEFAULT_PORT);
      } else {
        console.error(`Port ${port} is in use and no fallback available. Free the port or set PORT to a free value.`);
        process.exit(1);
      }
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
  start(port);
}

boot();
