import { query, pool } from './backend/src/config/db.js';
import { loadEnv } from './backend/src/config/env.js';

const verify = async () => {
    try {
        loadEnv();
        console.log('Verifying columns...');
        const r = await query(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_name IN ('buses', 'routes', 'drivers') 
              AND column_name = 'campus_id'
            ORDER BY table_name
        `);

        if (r.rows.length === 3) {
            console.log('VERIFICATION_SUCCESS: All tables have campus_id');
            r.rows.forEach(row => console.log(` - ${row.table_name}: FOUND`));
        } else {
            console.log('VERIFICATION_FAILED: Missing columns');
            console.log('Found:', r.rows);
        }
    } catch (err) {
        console.error('VERIFICATION_ERROR:', err.message);
    } finally {
        await pool.end();
    }
};

verify();
