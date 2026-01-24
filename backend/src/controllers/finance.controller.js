import * as service from '../services/finance.service.js';
import * as studentsSvc from '../services/students.service.js';
import * as teachersSvc from '../services/teachers.service.js';
import * as driversSvc from '../services/drivers.service.js';
import * as parentsSvc from '../services/parents.service.js';

// ========================================
// USER CHECKS
// ========================================

// Check if any users exist
export const checkUsersExist = async (req, res, next) => {
  try {
    const result = await service.checkUsersExist({ campusId: req.user?.campusId });
    res.json(result);
  } catch (e) { next(e); }
};

// Get users by type
export const getUsersByType = async (req, res, next) => {
  try {
    const users = await service.getUsersByTypeScoped(req.params.type, { campusId: req.user?.campusId });
    res.json({ items: users });
  } catch (e) { next(e); }
};

// ========================================
// DASHBOARD
// ========================================

// Get dashboard statistics
export const getDashboardStats = async (req, res, next) => {
  try {
    let { userType, campusId } = req.query;
    if (req.user?.role === 'student') userType = 'student';
    if (req.user?.role === 'teacher') userType = 'teacher';
    if (req.user?.role === 'driver') userType = 'driver';

    // Allow campus override for admins/owners
    const effectiveCampusId = (req.user?.role === 'admin' || req.user?.role === 'owner') && campusId !== undefined
      ? (campusId === 'all' ? null : campusId)
      : req.user?.campusId;

    const stats = await service.getDashboardStats({ userType, campusId: effectiveCampusId });
    res.json(stats);
  } catch (e) { next(e); }
};

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    let { userType, days } = req.query;
    if (req.user?.role === 'student') userType = 'student';
    if (req.user?.role === 'teacher') userType = 'teacher';
    if (req.user?.role === 'driver') userType = 'driver';
    const analytics = await service.getDashboardAnalytics({ userType, days, campusId: req.user?.campusId });
    res.json(analytics);
  } catch (e) { next(e); }
};

// ========================================
// UNIFIED INVOICES
// ========================================

// List unified invoices
export const listUnifiedInvoices = async (req, res, next) => {
  try {
    let { userType, userId, status, invoiceType, page, pageSize } = req.query;
    let userIds = undefined;

    // Self-only access for non-admin/owner
    if (req.user?.role === 'student') {
      const self = await studentsSvc.getByUserId(req.user.id);
      userType = 'student';
      userId = self?.id;
    }
    if (req.user?.role === 'teacher') {
      const self = await teachersSvc.getByUserId(req.user.id);
      userType = 'teacher';
      userId = self?.id;
    }
    if (req.user?.role === 'driver') {
      const self = await driversSvc.getDriverByUserId(req.user.id);
      userType = 'driver';
      userId = self?.id;
    }

    if (req.user?.role === 'parent') {
      const parent = await parentsSvc.getByUserId(req.user.id);
      if (parent) {
        const kids = await studentsSvc.list({ familyNumber: parent.familyNumber, pageSize: 1000, campusId: req.user?.campusId });
        userIds = kids.rows.map(k => k.id);
        userType = 'student';
      }
    }

    const result = await service.listUnifiedInvoices({
      userType, userId, userIds, status, invoiceType, page, pageSize,
      campusId: req.user?.campusId
    });
    res.json(result);
  } catch (e) { next(e); }
};

// Get unified invoice by ID
export const getUnifiedInvoiceById = async (req, res, next) => {
  try {
    const invoice = await service.getUnifiedInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (e) { next(e); }
};

// Create unified invoice
export const createUnifiedInvoice = async (req, res, next) => {
  try {
    // Check if users exist first
    const { hasUsers } = await service.checkUsersExist({ campusId: req.user?.campusId });
    if (!hasUsers) {
      return res.status(400).json({
        message: 'Please add a Student, Teacher, or Driver before creating financial records.',
        code: 'NO_USERS'
      });
    }

    const invoice = await service.createUnifiedInvoice({ ...req.body, campusId: req.user?.campusId }, req.user?.id);
    res.status(201).json(invoice);
  } catch (e) { next(e); }
};

// Update unified invoice
export const updateUnifiedInvoice = async (req, res, next) => {
  try {
    const invoice = await service.updateUnifiedInvoice(req.params.id, req.body);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (e) { next(e); }
};

// Delete unified invoice
export const deleteUnifiedInvoice = async (req, res, next) => {
  try {
    await service.deleteUnifiedInvoice(req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
};

// ========================================
// UNIFIED PAYMENTS
// ========================================

// List unified payments
export const listUnifiedPayments = async (req, res, next) => {
  try {
    let { userType, userId, invoiceId, page, pageSize } = req.query;

    // Self-only access for non-admin/owner
    if (req.user?.role === 'student') {
      const self = await studentsSvc.getByUserId(req.user.id);
      userType = 'student';
      userId = self?.id;
    }
    if (req.user?.role === 'teacher') {
      const self = await teachersSvc.getByUserId(req.user.id);
      userType = 'teacher';
      userId = self?.id;
    }
    if (req.user?.role === 'driver') {
      const self = await driversSvc.getDriverByUserId(req.user.id);
      userType = 'driver';
      userId = self?.id;
    }

    const result = await service.listUnifiedPayments({ userType, userId, invoiceId, campusId: req.user?.campusId, page, pageSize });
    res.json(result);
  } catch (e) { next(e); }
};

// Create unified payment
export const createUnifiedPayment = async (req, res, next) => {
  try {
    const payment = await service.createUnifiedPayment(req.body, req.user?.id);
    res.status(201).json(payment);
  } catch (e) { next(e); }
};

// ========================================
// RECEIPTS
// ========================================

// List receipts
export const listReceipts = async (req, res, next) => {
  try {
    let { userType, userId, page, pageSize } = req.query;
    let userIds = undefined;

    // Self-only access for non-admin/owner
    if (req.user?.role === 'student') {
      const self = await studentsSvc.getByUserId(req.user.id);
      userType = 'student';
      userId = self?.id;
    }
    if (req.user?.role === 'teacher') {
      const self = await teachersSvc.getByUserId(req.user.id);
      userType = 'teacher';
      userId = self?.id;
    }
    if (req.user?.role === 'driver') {
      const self = await driversSvc.getDriverByUserId(req.user.id);
      userType = 'driver';
      userId = self?.id;
    }

    if (req.user?.role === 'parent') {
      const parent = await parentsSvc.getByUserId(req.user.id);
      if (parent) {
        const kids = await studentsSvc.list({ familyNumber: parent.familyNumber, pageSize: 1000, campusId: req.user?.campusId });
        userIds = kids.rows.map(k => k.id);
        userType = 'student';
      }
    }

    const result = await service.listReceipts({ userType, userId, userIds, campusId: req.user?.campusId, page, pageSize });
    res.json(result);
  } catch (e) { next(e); }
};

// Create receipt
export const createReceipt = async (req, res, next) => {
  try {
    const receipt = await service.createReceipt(req.body.paymentId, req.user?.id);
    res.status(201).json(receipt);
  } catch (e) { next(e); }
};

// ========================================
// OUTSTANDING FEES
// ========================================

export const getOutstandingFees = async (req, res, next) => {
  try {
    let { userType, page, pageSize } = req.query;
    let userIds = undefined;

    // Self-only access for non-admin/owner
    if (req.user?.role === 'student') {
      const self = await studentsSvc.getByUserId(req.user.id);
      userType = 'student';
      userIds = self?.id ? [self.id] : [];
    }
    if (req.user?.role === 'teacher') {
      const self = await teachersSvc.getByUserId(req.user.id);
      userType = 'teacher';
      userIds = self?.id ? [self.id] : [];
    }
    if (req.user?.role === 'driver') {
      const self = await driversSvc.getDriverByUserId(req.user.id);
      userType = 'driver';
      userIds = self?.id ? [self.id] : [];
    }

    if (req.user?.role === 'parent') {
      const parent = await parentsSvc.getByUserId(req.user.id);
      if (parent) {
        const kids = await studentsSvc.list({ familyNumber: parent.familyNumber, pageSize: 1000, campusId: req.user?.campusId });
        userIds = kids.rows.map(k => k.id);
        userType = 'student';
      }
    }

    const result = await service.getOutstandingFees({ userType, userIds, page, pageSize, campusId: req.user?.campusId });
    res.json(result);
  } catch (e) { next(e); }
};

// ========================================
// PAYROLL
// ========================================

export const getPayrollSummary = async (req, res, next) => {
  try {
    const { role, periodMonth, status, page, pageSize, campusId } = req.query;

    // Allow campus override for admins/owners
    const effectiveCampusId = (req.user?.role === 'admin' || req.user?.role === 'owner') && campusId !== undefined
      ? (campusId === 'all' ? null : campusId)
      : req.user?.campusId;

    const result = await service.getPayrollSummary({ role, periodMonth, status, page, pageSize, campusId: effectiveCampusId });
    res.json(result);
  } catch (e) { next(e); }
};

// ========================================
// FINANCIAL RECORD CHECK
// ========================================

export const checkFinancialRecords = async (req, res, next) => {
  try {
    const { userType, userId } = req.params;
    const hasRecords = await service.hasFinancialRecords(userType, userId);
    res.json({ hasRecords });
  } catch (e) { next(e); }
};

// ========================================
// LEGACY ENDPOINTS (Student-only)
// ========================================

export const listInvoices = async (req, res, next) => {
  try {
    const { studentId, status, page, pageSize } = req.query;
    const items = await service.listInvoices({ studentId, status, page, pageSize });
    res.json({ items });
  } catch (e) { next(e); }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const row = await service.getInvoiceById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Invoice not found' });
    res.json(row);
  } catch (e) { next(e); }
};

export const createInvoice = async (req, res, next) => {
  try {
    const row = await service.createInvoice(req.body);
    res.status(201).json(row);
  } catch (e) { next(e); }
};

export const updateInvoice = async (req, res, next) => {
  try {
    const row = await service.updateInvoice(req.params.id, req.body);
    if (!row) return res.status(404).json({ message: 'Invoice not found' });
    res.json(row);
  } catch (e) { next(e); }
};

export const deleteInvoice = async (req, res, next) => {
  try {
    await service.deleteInvoice(req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
};

export const listPayments = async (req, res, next) => {
  try {
    const items = await service.listPayments(req.params.id);
    res.json({ items });
  } catch (e) { next(e); }
};

export const addPayment = async (req, res, next) => {
  try {
    const row = await service.addPayment(req.params.id, req.body);
    res.status(201).json(row);
  } catch (e) { next(e); }
};
