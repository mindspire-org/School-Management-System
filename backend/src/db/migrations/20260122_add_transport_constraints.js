import { query, pool } from '../../config/db.js';
import { loadEnv } from '../../config/env.js';

const migrate = async () => {
    console.log('Starting migration: Add UNIQUE constraint to student_transport');
    try {
        loadEnv();

        // Check if constraint already exists
        const checkResult = await query(`
      SELECT 1 FROM pg_constraint WHERE conname = 'student_transport_student_id_key'
    `);

        if (checkResult.rows.length === 0) {
            console.log('Adding UNIQUE(student_id) to student_transport...');
            // First, delete duplicates if they exist (keep the latest assignment)
            await query(`
        DELETE FROM student_transport a
        USING student_transport b
        WHERE a.id < b.id AND a.student_id = b.student_id
      `);

            await query(`
        ALTER TABLE student_transport ADD CONSTRAINT student_transport_student_id_key UNIQUE (student_id)
      `);
            console.log('Constraint added successfully.');
        } else {
            console.log('Constraint already exists, skipping.');
        }
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

migrate();
