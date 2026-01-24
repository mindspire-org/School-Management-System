import { query, pool } from './backend/src/config/db.js';
import { loadEnv } from './backend/src/config/env.js';

loadEnv();
query('SELECT id, name FROM campuses').then(r => {
    console.log('CAMPUSES:');
    console.log(JSON.stringify(r.rows, null, 2));
    pool.end();
}).catch(err => {
    console.error(err);
    pool.end();
});
