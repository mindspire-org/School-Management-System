import { loadEnv } from '../config/env.js';
import { pool, query } from '../config/db.js';
import { ensureParentsSchema, ensureParentMessagesSchema } from './autoMigrate.js';

loadEnv();

async function main() {
  try {
    try { await ensureParentsSchema(); } catch (_) {}
    try { await ensureParentMessagesSchema(); } catch (_) {}

    const { rows: tables } = await query(
      `SELECT table_name 
         FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('parents', 'parent_messages')
        ORDER BY table_name`
    );

    const { rows: counts } = await query(
      `SELECT 'parents' AS table, COUNT(*)::int AS count FROM parents
       UNION ALL
       SELECT 'parent_messages' AS table, COUNT(*)::int AS count FROM parent_messages`
    ).catch(() => ({ rows: [] }));

    console.log('Tables present:', tables.map(t => t.table_name).join(', ') || '(none)');
    console.log('Row counts:', counts.map(c => `${c.table}=${c.count}`).join(', ') || '(n/a)');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('ensureExtras error:', e);
  process.exit(1);
});

