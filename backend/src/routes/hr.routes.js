import { Router } from 'express';
import { Payroll, AdvanceSalary, Leave, Award } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { query } from '../config/db.js';

const router = Router();

router.use(authenticate);

const adminRoles = new Set(['admin', 'owner', 'superadmin']);

const resolveCampusId = (req) => {
    const headerCampusId =
        req.headers?.['x-campus-id'] ??
        req.headers?.['x-campusid'] ??
        req.headers?.['campus-id'] ??
        req.headers?.['campusid'];
    const raw = headerCampusId ?? req.query?.campusId ?? req.body?.campusId;
    const requested = raw === '' || raw === undefined || raw === null ? null : raw;
    const role = req.user?.role;
    const authCampusId = req.user?.campusId;

    if (authCampusId && !adminRoles.has(role)) return Number(authCampusId);
    const resolved = requested ?? authCampusId;
    if (resolved === '' || resolved === undefined || resolved === null) return null;
    const n = Number(resolved);
    if (Number.isNaN(n)) return null;
    return n;
};

const requireCampusId = (req, res) => {
    const campusId = resolveCampusId(req);
    if (!campusId) {
        res.status(400).json({ error: 'campusId is required' });
        return null;
    }
    return campusId;
};

// Generic CRUD helper
const createCRUD = (Model) => ({
    list: async (req, res) => {
        try {
            const campusId = requireCampusId(req, res);
            if (!campusId) return;
            const where = { campusId };
            const items = await Model.findAll({ where });
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    get: async (req, res) => {
        try {
            const campusId = requireCampusId(req, res);
            if (!campusId) return;
            const item = await Model.findByPk(req.params.id);
            if (!item) return res.status(404).json({ error: 'Not found' });
            if (String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
            res.json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    create: async (req, res) => {
        try {
            const campusId = requireCampusId(req, res);
            if (!campusId) return;
            const item = await Model.create({ ...req.body, campusId });
            res.status(201).json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const campusId = requireCampusId(req, res);
            if (!campusId) return;
            const item = await Model.findByPk(req.params.id);
            if (!item) return res.status(404).json({ error: 'Not found' });
            if (String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
            await item.update({ ...req.body, campusId });
            res.json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            const campusId = requireCampusId(req, res);
            if (!campusId) return;
            const item = await Model.findByPk(req.params.id);
            if (!item) return res.status(404).json({ error: 'Not found' });
            if (String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
            await item.destroy();
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
});

// Employees (used by Card Management). We treat teachers as employees.
router.get('/employees', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        const params = [];
        const where = [];

        if (campusId) {
            params.push(campusId);
            where.push(`campus_id = $${params.length}`);
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const { rows } = await query(
            `SELECT id, name, designation
             FROM teachers
             ${whereSql}
             ORDER BY id ASC`,
            params
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/employees/:id', async (req, res) => {
    try {
        const campusId = resolveCampusId(req);
        const id = Number(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid id' });

        const params = [id];
        let whereSql = 'WHERE id = $1';
        if (campusId) {
            params.push(campusId);
            whereSql += ` AND campus_id = $2`;
        }

        const { rows } = await query(
            `SELECT id, name, designation
             FROM teachers
             ${whereSql}
             LIMIT 1`,
            params
        );
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Payroll routes
const parseMonthToNumber = (month) => {
    const m = String(month || '').trim().toLowerCase();
    const map = {
        january: 1,
        february: 2,
        march: 3,
        april: 4,
        may: 5,
        june: 6,
        july: 7,
        august: 8,
        september: 9,
        october: 10,
        november: 11,
        december: 12,
    };
    return map[m] || null;
};

const mapPayrollRow = (row) => {
    const status = String(row?.status || '').toLowerCase() === 'paid' ? 'Paid' : 'Pending';
    return {
        id: row.id,
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        month: row.month,
        year: Number(row.year),
        basicSalary: row.basicSalary,
        allowances: row.allowances,
        deductions: row.deductions,
        netSalary: row.netSalary,
        status,
        paymentDate: row.paymentDate,
        paymentMethod: row.paymentMethod,
        bankName: row.bankName,
        accountTitle: row.accountTitle,
        accountNumber: row.accountNumber,
        iban: row.iban,
        chequeNumber: row.chequeNumber,
        transactionReference: row.transactionReference,
        campusId: row.campusId,
    };
};

router.get('/payroll', async (req, res) => {
    try {
        const campusId = requireCampusId(req, res);
        if (!campusId) return;

        const { rows } = await query(
            `SELECT
                tp.id,
                tp.teacher_id AS "employeeId",
                t.name AS "employeeName",
                TO_CHAR(tp.period_month, 'FMMonth') AS month,
                EXTRACT(YEAR FROM tp.period_month)::int AS year,
                tp.base_salary::numeric AS "basicSalary",
                tp.allowances::numeric AS allowances,
                tp.deductions::numeric AS deductions,
                tp.total_amount::numeric AS "netSalary",
                tp.status AS status,
                tp.paid_on AS "paymentDate",
                tp.payment_method AS "paymentMethod",
                tp.bank_name AS "bankName",
                tp.account_title AS "accountTitle",
                tp.account_number AS "accountNumber",
                tp.iban AS "iban",
                tp.cheque_number AS "chequeNumber",
                tp.transaction_reference AS "transactionReference",
                tp.campus_id AS "campusId"
             FROM teacher_payrolls tp
             JOIN teachers t ON t.id = tp.teacher_id
             WHERE tp.campus_id = $1
             ORDER BY tp.period_month DESC, t.name ASC`,
            [campusId]
        );

        res.json(rows.map(mapPayrollRow));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/payroll/generate', async (req, res) => {
    try {
        const campusId = requireCampusId(req, res);
        if (!campusId) return;

        const { month, year } = req.body || {};
        const y = Number(year);
        const m = parseMonthToNumber(month);
        if (!y || !m) return res.status(400).json({ error: 'month and year are required' });

        const periodMonth = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-01`;
        const createdBy = req.user?.id ?? null;

        const { rows: teacherRows } = await query(
            `SELECT id, name,
                    COALESCE(base_salary, 0)::numeric AS base_salary,
                    COALESCE(allowances, 0)::numeric AS allowances,
                    COALESCE(deductions, 0)::numeric AS deductions
               FROM teachers
              WHERE campus_id = $1
              ORDER BY id ASC`,
            [campusId]
        );

        if (!teacherRows.length) {
            return res.json({ message: 'No employees found for payroll generation', month, year, count: 0 });
        }

        for (const t of teacherRows) {
            const baseSalary = Number(t.base_salary || 0);
            const allowances = Number(t.allowances || 0);
            const deductions = Number(t.deductions || 0);
            const bonuses = 0;
            const total = baseSalary + allowances + bonuses - deductions;

            await query(
                `INSERT INTO teacher_payrolls
                    (teacher_id, period_month, base_salary, allowances, deductions, bonuses, total_amount, status, paid_on, notes, created_by, campus_id)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',NULL,NULL,$8,$9)
                 ON CONFLICT ON CONSTRAINT teacher_payrolls_teacher_id_period_month_key
                 DO UPDATE SET
                    base_salary = EXCLUDED.base_salary,
                    allowances = EXCLUDED.allowances,
                    deductions = EXCLUDED.deductions,
                    bonuses = EXCLUDED.bonuses,
                    total_amount = EXCLUDED.total_amount,
                    updated_at = NOW()`,
                [Number(t.id), periodMonth, baseSalary, allowances, deductions, bonuses, total, createdBy, campusId]
            );
        }

        res.json({ message: 'Payroll generated', month, year, count: teacherRows.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/payroll/:id', async (req, res) => {
    try {
        const campusId = requireCampusId(req, res);
        if (!campusId) return;
        const id = Number(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid id' });

        const { rows } = await query(
            `SELECT
                tp.id,
                tp.teacher_id AS "employeeId",
                t.name AS "employeeName",
                TO_CHAR(tp.period_month, 'FMMonth') AS month,
                EXTRACT(YEAR FROM tp.period_month)::int AS year,
                tp.base_salary::numeric AS "basicSalary",
                tp.allowances::numeric AS allowances,
                tp.deductions::numeric AS deductions,
                tp.total_amount::numeric AS "netSalary",
                tp.status AS status,
                tp.paid_on AS "paymentDate",
                tp.payment_method AS "paymentMethod",
                tp.bank_name AS "bankName",
                tp.account_title AS "accountTitle",
                tp.account_number AS "accountNumber",
                tp.iban AS "iban",
                tp.cheque_number AS "chequeNumber",
                tp.transaction_reference AS "transactionReference",
                tp.campus_id AS "campusId"
             FROM teacher_payrolls tp
             JOIN teachers t ON t.id = tp.teacher_id
             WHERE tp.id = $1 AND tp.campus_id = $2
             LIMIT 1`,
            [id, campusId]
        );
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(mapPayrollRow(rows[0]));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/payroll/:id/slip', async (req, res) => {
    try {
        const campusId = requireCampusId(req, res);
        if (!campusId) return;
        const id = Number(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid id' });

        const { rows } = await query(
            `SELECT
                tp.id,
                tp.teacher_id AS "employeeId",
                t.name AS "employeeName",
                TO_CHAR(tp.period_month, 'FMMonth') AS month,
                EXTRACT(YEAR FROM tp.period_month)::int AS year,
                tp.base_salary::numeric AS "basicSalary",
                tp.allowances::numeric AS allowances,
                tp.deductions::numeric AS deductions,
                tp.total_amount::numeric AS "netSalary",
                tp.status AS status,
                tp.paid_on AS "paymentDate",
                tp.payment_method AS "paymentMethod",
                tp.bank_name AS "bankName",
                tp.account_title AS "accountTitle",
                tp.account_number AS "accountNumber",
                tp.iban AS "iban",
                tp.cheque_number AS "chequeNumber",
                tp.transaction_reference AS "transactionReference",
                tp.campus_id AS "campusId"
             FROM teacher_payrolls tp
             JOIN teachers t ON t.id = tp.teacher_id
             WHERE tp.id = $1 AND tp.campus_id = $2
             LIMIT 1`,
            [id, campusId]
        );
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json({ ...mapPayrollRow(rows[0]), slipUrl: `/generated/slips/${rows[0].id}.pdf` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Advance Salary routes
const advanceSalaryCRUD = createCRUD(AdvanceSalary);
router.get('/advance-salary', advanceSalaryCRUD.list);
router.get('/advance-salary/:id', advanceSalaryCRUD.get);
router.post('/advance-salary', advanceSalaryCRUD.create);
router.put('/advance-salary/:id', advanceSalaryCRUD.update);
router.delete('/advance-salary/:id', advanceSalaryCRUD.delete);

router.post('/advance-salary/:id/approve', async (req, res) => {
    try {
        const campusId = requireCampusId(req, res);
        if (!campusId) return;
        const item = await AdvanceSalary.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        if (String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
        await item.update({ status: 'Approved', approvedBy: req.body.approvedBy, campusId });
        res.json({ message: 'Approved' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/advance-salary/:id/reject', async (req, res) => {
    try {
        const campusId = requireCampusId(req, res);
        if (!campusId) return;
        const item = await AdvanceSalary.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        if (String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
        await item.update({ status: 'Rejected', rejectionReason: req.body.reason, campusId });
        res.json({ message: 'Rejected' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Leave routes
const leaveCRUD = createCRUD(Leave);
router.get('/leave', leaveCRUD.list);
router.get('/leave/:id', leaveCRUD.get);
router.post('/leave', leaveCRUD.create);
router.put('/leave/:id', leaveCRUD.update);
router.delete('/leave/:id', leaveCRUD.delete);

router.post('/leave/:id/approve', async (req, res) => {
    try {
        const campusId = requireCampusId(req, res);
        if (!campusId) return;
        const item = await Leave.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        if (String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
        await item.update({ status: 'Approved', approvedBy: req.body.approvedBy, campusId });
        res.json({ message: 'Approved' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/leave/:id/reject', async (req, res) => {
    try {
        const campusId = requireCampusId(req, res);
        if (!campusId) return;
        const item = await Leave.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        if (String(item.campusId) !== String(campusId)) return res.status(404).json({ error: 'Not found' });
        await item.update({ status: 'Rejected', rejectionReason: req.body.reason, campusId });
        res.json({ message: 'Rejected' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/leave/balance/:employeeId', async (req, res) => {
    // In real implementation, calculate from Leave table
    res.json({ casual: 10, sick: 7, annual: 15 });
});

// Award routes
const awardCRUD = createCRUD(Award);
router.get('/awards', awardCRUD.list);
router.get('/awards/:id', awardCRUD.get);
router.post('/awards', awardCRUD.create);
router.put('/awards/:id', awardCRUD.update);
router.delete('/awards/:id', awardCRUD.delete);

export default router;
