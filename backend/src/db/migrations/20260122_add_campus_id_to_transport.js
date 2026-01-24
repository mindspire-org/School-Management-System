import { query, pool } from '../../config/db.js';
import { loadEnv } from '../../config/env.js';

const migrate = async () => {
    console.log('Starting migration: Add campus_id to transport tables');
    try {
        loadEnv();

        // 1. Buses
        const busCols = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'buses' AND column_name = 'campus_id'`);
        if (busCols.rows.length === 0) {
            console.log('Adding campus_id to buses...');
            await query(`ALTER TABLE buses ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL`);
            await query(`CREATE INDEX idx_buses_campus_id ON buses(campus_id)`);
        } else {
            console.log('campus_id already exists in buses table.');
        }

        // 2. Routes
        const routeCols = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'campus_id'`);
        if (routeCols.rows.length === 0) {
            console.log('Adding campus_id to routes...');
            await query(`ALTER TABLE routes ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL`);
            await query(`CREATE INDEX idx_routes_campus_id ON routes(campus_id)`);
        } else {
            console.log('campus_id already exists in routes table.');
        }

        // 3. Drivers
        const driverCols = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'campus_id'`);
        if (driverCols.rows.length === 0) {
            console.log('Adding campus_id to drivers...');
            await query(`ALTER TABLE drivers ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL`);
            await query(`CREATE INDEX idx_drivers_campus_id ON drivers(campus_id)`);
        } else {
            console.log('campus_id already exists in drivers table.');
        }

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

migrate();
