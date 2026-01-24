import { query, pool } from './backend/src/config/db.js';
import { loadEnv } from './backend/src/config/env.js';

const audit = async () => {
    try {
        loadEnv();
        const tables = ['buses', 'routes', 'students', 'student_transport', 'bus_assignments', 'route_stops', 'drivers'];
        console.log('--- Database Schema Audit ---');
        for (const table of tables) {
            const r = await query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.log(`\nTable: ${table}`);
            console.table(r.rows);
        }
    } catch (err) {
        console.error('Audit Error:', err.message);
    } finally {
        await pool.end();
    }
};

audit();
