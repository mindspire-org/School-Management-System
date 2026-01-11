import * as service from '../services/drivers.service.js';
import bcrypt from 'bcryptjs';
import * as authSvc from '../services/auth.service.js';

// List all drivers
export const listDrivers = async (req, res, next) => {
    try {
        const { status, busId, page, pageSize } = req.query;
        if (req.user?.role === 'driver') {
            const self = await service.getDriverByUserId(req.user.id);
            return res.json({ items: self ? [self] : [], total: self ? 1 : 0 });
        }
        const result = await service.listDrivers({ status, busId, page, pageSize });
        res.json(result);
    } catch (e) { next(e); }
};

// Get driver by ID
export const getDriverById = async (req, res, next) => {
    try {
        if (req.user?.role === 'driver') {
            const self = await service.getDriverByUserId(req.user.id);
            if (!self || String(self.id) !== String(req.params.id)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
        }
        const driver = await service.getDriverById(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (e) { next(e); }
};

// Create driver
export const createDriver = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        let credentials = null;
        if (!payload.userId) {
            let user = null;
            if (payload.email) {
                try { user = await authSvc.findUserByEmail(payload.email); } catch (_) { user = null; }
            }
            if (!user) {
                const base = payload.licenseNumber || payload.name || payload.email || 'driver';
                const username = await authSvc.generateUniqueUsername({ base, role: 'driver' });
                const password = authSvc.generateRandomPassword(12);
                const passwordHash = await bcrypt.hash(password, 10);
                user = await authSvc.createUserWith({ email: payload.email || null, username, passwordHash, role: 'driver', name: payload.name || username });
                credentials = { username, password };
            }
            if (user) payload.userId = user.id;
        }
        const driver = await service.createDriver(payload);
        const resp = credentials ? { ...driver, credentials } : driver;
        res.status(201).json(resp);
    } catch (e) { next(e); }
};

// Update driver
export const updateDriver = async (req, res, next) => {
    try {
        const driver = await service.updateDriver(req.params.id, req.body);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (e) { next(e); }
};

// Delete driver - with financial records warning
export const deleteDriver = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { force } = req.query;

        // Check if driver has financial records
        const hasRecords = await service.hasFinancialRecords(id);
        if (hasRecords && force !== 'true') {
            return res.status(409).json({
                message: 'This driver has financial records. Deleting may affect reports.',
                hasFinancialRecords: true,
                requiresConfirmation: true
            });
        }

        await service.deleteDriver(id);
        res.json({ success: true });
    } catch (e) { next(e); }
};

// Get driver payroll
export const getDriverPayroll = async (req, res, next) => {
    try {
        const { page, pageSize } = req.query;
        if (req.user?.role === 'driver') {
            const self = await service.getDriverByUserId(req.user.id);
            if (!self || String(self.id) !== String(req.params.id)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
        }
        const items = await service.getDriverPayroll(req.params.id, { page, pageSize });
        res.json({ items });
    } catch (e) { next(e); }
};

// Create driver payroll
export const createDriverPayroll = async (req, res, next) => {
    try {
        const payroll = await service.createDriverPayroll({
            ...req.body,
            driverId: req.params.id,
            createdBy: req.user?.id
        });
        res.status(201).json(payroll);
    } catch (e) { next(e); }
};

// Update payroll status
export const updatePayrollStatus = async (req, res, next) => {
    try {
        const { status, transactionReference } = req.body;
        const result = await service.updateDriverPayrollStatus(req.params.payrollId, status, transactionReference);
        if (!result) return res.status(404).json({ message: 'Payroll not found' });
        res.json(result);
    } catch (e) { next(e); }
};

// Count drivers
export const countDrivers = async (req, res, next) => {
    try {
        const count = await service.countDrivers();
        res.json({ count });
    } catch (e) { next(e); }
};
