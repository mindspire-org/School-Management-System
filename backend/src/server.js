import http from 'http';
import app from './app.js';
import { loadEnv } from './config/env.js';
import * as authService from './services/auth.service.js';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { pool, ensureAppDatabaseExists } from './config/db.js';
import { ensureAuthSchema, ensureCampusSchema, ensureCardManagementSchema, ensureCertificatesSchema, ensureMasterDataSchema, ensurePayrollSchema, ensureSharedContentSchema } from './db/autoMigrate.js';
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

  // Run database init tasks in the background so /health becomes reachable immediately.
  // This avoids Electron timing out on slower/unreachable Postgres.
  const withTimeout = async (label, fn, ms) => {
    const timeoutMs = Number(ms) || 20000;
    return await Promise.race([
      (async () => {
        try {
          return await fn();
        } catch (e) {
          try { console.error(`${label} failed:`, e?.stack || e); } catch (_) {}
          return null;
        }
      })(),
      new Promise((resolve) => setTimeout(() => {
        try { console.error(`${label} timed out after ${timeoutMs}ms`); } catch (_) {}
        resolve(null);
      }, timeoutMs)),
    ]);
  };

  (async () => {
    await withTimeout('DB ensure database', () => ensureAppDatabaseExists(), Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 15000);
    await withTimeout('DB base schema', () => ensureBaseSchema(), Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 20000);
    await withTimeout('DB auto-migration', async () => {
      await ensureAuthSchema();
      await ensureCampusSchema();
      await ensureCardManagementSchema();
      await ensureCertificatesSchema();
      await ensureMasterDataSchema();
      await ensurePayrollSchema();
      await ensureSharedContentSchema();
    }, Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 30000);
    await withTimeout('Sequelize init', () => initDb(), Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 30000);

    await withTimeout('Ensure owner user', async () => {
      const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
      const ownerPassword = process.env.OWNER_PASSWORD || 'Qutaibah@123';
      const ownerName = process.env.OWNER_NAME || 'Mindspire Owner';
      await authService.ensureOwnerUser({ email: ownerEmail, password: ownerPassword, name: ownerName });
    }, Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 15000);
  })();
}

boot();
