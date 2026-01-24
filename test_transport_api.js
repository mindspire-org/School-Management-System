import { getTransportStats, listStudentTransportEntries, listBuses, listRoutes } from './backend/src/services/transport.service.js';
import { pool, query } from './backend/src/config/db.js';
import { loadEnv } from './backend/src/config/env.js';

const test = async () => {
    try {
        loadEnv();
        console.log('--- Testing Transport Services ---');

        const campusId = 3;
        console.log(`1. Testing getTransportStats for campusId: ${campusId}...`);
        try {
            const stats = await getTransportStats(campusId);
            console.log('Stats Success:', stats);
        } catch (e) {
            console.error('Stats Failure:', e.message);
        }

        console.log(`\n2. Testing listBuses for campusId: ${campusId}...`);
        try {
            const buses = await listBuses(campusId);
            console.log('Buses Success (Count):', buses.length);
        } catch (e) {
            console.error('Buses Failure:', e.message);
        }

        console.log(`\n3. Testing listRoutes for campusId: ${campusId}...`);
        try {
            const routes = await listRoutes(campusId);
            console.log('Routes Success (Count):', routes.length);
        } catch (e) {
            console.error('Routes Failure:', e.message);
        }

        console.log(`\n4. Testing listStudentTransportEntries for campusId: ${campusId}...`);
        try {
            const entries = await listStudentTransportEntries(campusId, {});
            console.log('Entries Success (Count):', entries.length);
        } catch (e) {
            console.error('Entries Failure:', e.message);
        }

    } catch (err) {
        console.error('Global Error:', err.message);
    } finally {
        await pool.end();
    }
};

test();
