import { pool, query } from '../config/db.js';

async function main() {
  const result = { ok: false, db: null, checks: {} };
  const client = await pool.connect();
  try {
    const { rows: infoRows } = await client.query('SELECT current_database() AS db, now() AS ts');
    result.db = infoRows[0]?.db || null;

    // Check core tables exist
    const { rows: reg } = await client.query(
      "SELECT to_regclass('public.users') AS users, to_regclass('public.students') AS students, to_regclass('public.teachers') AS teachers, to_regclass('public.settings') AS settings"
    );
    result.checks.tables = reg[0];

    // Simple reads
    const { rows: usersCount } = await client.query('SELECT COUNT(*)::int AS n FROM users');
    const { rows: studentsCount } = await client.query('SELECT COUNT(*)::int AS n FROM students');
    result.checks.counts = {
      users: usersCount[0]?.n ?? 0,
      students: studentsCount[0]?.n ?? 0,
    };

    // CRUD smoke on settings (transactional, cleaned up)
    const key = 'connectivity.smoke';
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO settings (key, value, updated_at) VALUES ($1,$2,NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, String(Date.now())]
    );
    const { rows: readRows } = await client.query('SELECT value FROM settings WHERE key = $1', [key]);
    await client.query('DELETE FROM settings WHERE key = $1', [key]);
    await client.query('COMMIT');
    result.checks.settingsCrud = { inserted: true, readValue: readRows[0]?.value ?? null, deleted: true };

    result.ok = true;
    console.log('[verify] Connected to DB:', result.db);
    console.log('[verify] Tables present:', result.checks.tables);
    console.log('[verify] Counts:', result.checks.counts);
    console.log('[verify] Settings CRUD OK');
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    console.error('[verify] Verification failed:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
