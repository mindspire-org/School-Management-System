import http from 'http';
import app from './app.js';
import { loadEnv } from './config/env.js';
import * as authService from './services/auth.service.js';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { pool, ensureAppDatabaseExists } from './config/db.js';
import { ensureAuthSchema, ensureCampusSchema, ensureCardManagementSchema, ensureCertificatesSchema, ensureClassSectionsSchema, ensureExamResultsSchema, ensureMasterDataSchema, ensurePayrollSchema, ensureSharedContentSchema, ensureTeachersNameColumn, ensureCoreTableColumns } from './db/autoMigrate.js';
import { initDb } from './models/index.js';

loadEnv();

// Use a stable default port for Electron packaging
const DEFAULT_PORT = 59201;
let port = Number(process.env.PORT) || DEFAULT_PORT;

async function ensureBaseSchema() {
  // Always run schema.sql on every boot — every statement uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
  // so it is safe to re-apply against an existing database.

  // Handle Sequelize-created enum type for users.role before schema.sql runs
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name = 'role'
            AND data_type = 'USER-DEFINED'
            AND udt_name = 'enum_users_role'
        ) THEN
          BEGIN
            EXECUTE 'ALTER TYPE enum_users_role ADD VALUE IF NOT EXISTS ''owner''';
          EXCEPTION WHEN others THEN
            NULL;
          END;
          BEGIN
            EXECUTE 'ALTER TYPE enum_users_role ADD VALUE IF NOT EXISTS ''parent''';
          EXCEPTION WHEN others THEN
            NULL;
          END;
        END IF;
      END $$;
    `);
  } catch (_) { }

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  // Split SQL into individual statements, respecting $$ dollar-quote blocks (used in DO $$ ... $$ blocks).
  function splitStatements(raw) {
    const stmts = [];
    let buf = '';
    let inDollarQuote = false;
    let dollarTag = '';
    let i = 0;
    while (i < raw.length) {
      // Detect start/end of dollar-quote (e.g. $$ or $BODY$)
      if (!inDollarQuote && raw[i] === '$') {
        const rest = raw.slice(i);
        const m = rest.match(/^\$[A-Za-z_]*\$/);
        if (m) {
          dollarTag = m[0];
          inDollarQuote = true;
          buf += dollarTag;
          i += dollarTag.length;
          continue;
        }
      } else if (inDollarQuote && raw.slice(i, i + dollarTag.length) === dollarTag) {
        buf += dollarTag;
        i += dollarTag.length;
        inDollarQuote = false;
        dollarTag = '';
        continue;
      }

      if (!inDollarQuote && raw[i] === ';') {
        const s = buf.trim();
        if (s) stmts.push(s);
        buf = '';
        i++;
        continue;
      }

      buf += raw[i++];
    }
    const tail = buf.trim();
    if (tail) stmts.push(tail);
    return stmts;
  }

  const statements = splitStatements(sql);

  for (const stmt of statements) {
    try {
      await pool.query(stmt);
    } catch (e) {
      // Ignore benign DDL errors expected on re-runs against existing schema
      const msg = e?.message || '';
      const isNoop =
        e?.code === '42701' || // column already exists
        e?.code === '42703' || // column does not exist (view rebuild etc.)
        e?.code === '42P07' || // relation already exists
        e?.code === '42710' || // constraint already exists
        e?.code === '23505' || // unique violation on seed data
        e?.code === '42P16' || // invalid table definition
        e?.code === '0A000' || // feature not supported (e.g. ALTER TYPE in transaction)
        msg.includes('already exists') ||
        msg.includes('does not exist');
      if (!isNoop) {
        console.warn('[schema] Skipped statement due to error:', msg.slice(0, 120));
      }
    }
  }

  console.log('[schema] ensureBaseSchema completed');
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
          try { console.error(`${label} failed:`, e?.stack || e); } catch (_) { }
          return null;
        }
      })(),
      new Promise((resolve) => setTimeout(() => {
        try { console.error(`${label} timed out after ${timeoutMs}ms`); } catch (_) { }
        resolve(null);
      }, timeoutMs)),
    ]);
  };

  (async () => {
    await withTimeout('DB ensure database', () => ensureAppDatabaseExists(), Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 15000);
    await withTimeout('DB campus schema', () => ensureCampusSchema(), Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 20000);
    //
    // Normalize legacy teachers schema before applying schema.sql (schema.sql assumes JSONB)
    //
    await withTimeout('DB teachers schema preflight', () => ensureTeachersNameColumn(), Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 30000);
    await withTimeout('DB base schema', () => ensureBaseSchema(), Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 20000);
    await withTimeout('DB auto-migration', async () => {
      await ensureAuthSchema();
      await ensureCoreTableColumns(); // Fix: add all missing columns to core tables (students, buses, alerts, etc.)
      await ensureTeachersNameColumn(); // Fix: add missing 'name' + all HR columns to teachers table
      await ensureCampusSchema();
      await ensureCardManagementSchema();
      await ensureCertificatesSchema();
      await ensureClassSectionsSchema();
      await ensureExamResultsSchema();
      await ensureMasterDataSchema();
      await ensurePayrollSchema();
      await ensureSharedContentSchema();
    }, Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 60000);
    await withTimeout('Sequelize init', () => initDb(), Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 60000);

    await withTimeout('Ensure owner user', async () => {
      // Always ensure auth schema (password_hash column, etc.) before writing the owner user,
      // in case the earlier auto-migration block timed out before completing.
      await ensureAuthSchema();
      const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
      const ownerPassword = process.env.OWNER_PASSWORD || 'Qutaibah@123';
      const ownerName = process.env.OWNER_NAME || 'Mindspire Owner';
      await authService.ensureOwnerUser({ email: ownerEmail, password: ownerPassword, name: ownerName });
    }, Number(process.env.SMS_DB_INIT_TIMEOUT_MS) || 45000);
  })();
}

boot();
