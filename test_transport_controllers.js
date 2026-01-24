import * as controller from './backend/src/controllers/transport.controller.js';
import { pool } from './backend/src/config/db.js';
import { loadEnv } from './backend/src/config/env.js';

const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.data = data; return res; };
    return res;
};

const mockNext = (err) => { if (err) throw err; };

const testControllers = async () => {
    try {
        loadEnv();
        console.log('--- Testing Transport Controllers ---');

        const req = {
            user: { campusId: 3, role: 'admin', id: 1 },
            query: {},
            params: {}
        };

        console.log('1. Testing controller.getStats...');
        try {
            const res = mockRes();
            await controller.getStats(req, res, mockNext);
            console.log('getStats Success:', res.data);
        } catch (e) {
            console.error('getStats Failure:', e.message);
        }

        console.log('\n2. Testing controller.listBuses...');
        try {
            const res = mockRes();
            await controller.listBuses(req, res, mockNext);
            console.log('listBuses Success (Items Count):', res.data.items?.length);
        } catch (e) {
            console.error('listBuses Failure:', e.message);
        }

        console.log('\n3. Testing controller.listRoutes...');
        try {
            const res = mockRes();
            await controller.listRoutes(req, res, mockNext);
            console.log('listRoutes Success (Items Count):', res.data.items?.length);
        } catch (e) {
            console.error('listRoutes Failure:', e.message);
        }

        console.log('\n4. Testing controller.listStudentEntries...');
        try {
            const res = mockRes();
            await controller.listStudentEntries(req, res, mockNext);
            console.log('listStudentEntries Success (Items Count):', res.data.items?.length);
        } catch (e) {
            console.error('listStudentEntries Failure:', e.message);
        }

    } catch (err) {
        console.error('Global Controller Test Error:', err.message);
    } finally {
        await pool.end();
    }
};

testControllers();
