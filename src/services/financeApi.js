import http from './http';

const API_BASE = '/finance';

/**
 * Finance API service for unified role-based finance operations
 */
export const financeApi = {
    // ========================================
    // USER CHECKS
    // ========================================

    /**
     * Check if any users exist (students, teachers, drivers)
     * @returns {Promise<{ hasUsers: boolean, counts: { students, teachers, drivers } }>}
     */
    checkUsersExist: async () => {
        return await http.get(`${API_BASE}/check-users`);
    },

    /**
     * Get users by type for dropdown
     * @param {'student'|'teacher'|'driver'} type
     * @returns {Promise<{ items: Array }>}
     */
    getUsersByType: async (type) => {
        return await http.get(`${API_BASE}/users/${type}`);
    },

    // ========================================
    // DASHBOARD
    // ========================================

    /**
     * Get dashboard statistics
     * @returns {Promise<Object>}
     */
    getDashboardStats: async (params = {}) => {
        return await http.get(`${API_BASE}/dashboard-stats`, { params });
    },

    getDashboardAnalytics: async (params = {}) => {
        return await http.get(`${API_BASE}/dashboard-analytics`, { params });
    },

    // ========================================
    // UNIFIED INVOICES
    // ========================================

    /**
     * List unified invoices
     * @param {Object} params - { userType, userId, status, invoiceType, page, pageSize }
     * @returns {Promise<{ items: Array, total: number }>}
     */
    listUnifiedInvoices: async (params = {}) => {
        return await http.get(`${API_BASE}/unified-invoices`, { params });
    },

    /**
     * Get unified invoice by ID
     * @param {number} id
     * @returns {Promise<Object>}
     */
    getUnifiedInvoiceById: async (id) => {
        return await http.get(`${API_BASE}/unified-invoices/${id}`);
    },

    /**
     * Create unified invoice
     * @param {Object} data - { userType, userId, invoiceType, amount, tax, discount, description, dueDate, periodMonth }
     * @returns {Promise<Object>}
     */
    createUnifiedInvoice: async (data) => {
        return await http.post(`${API_BASE}/unified-invoices`, data);
    },

    /**
     * Update unified invoice
     * @param {number} id
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    updateUnifiedInvoice: async (id, data) => {
        return await http.put(`${API_BASE}/unified-invoices/${id}`, data);
    },

    /**
     * Delete unified invoice
     * @param {number} id
     * @returns {Promise<{ success: boolean }>}
     */
    deleteUnifiedInvoice: async (id) => {
        return await http.delete(`${API_BASE}/unified-invoices/${id}`);
    },

    // ========================================
    // UNIFIED PAYMENTS
    // ========================================

    /**
     * List unified payments
     * @param {Object} params - { userType, userId, invoiceId, page, pageSize }
     * @returns {Promise<{ items: Array }>}
     */
    listUnifiedPayments: async (params = {}) => {
        return await http.get(`${API_BASE}/unified-payments`, { params });
    },

    /**
     * Create unified payment
     * @param {Object} data - { invoiceId, amount, method, referenceNumber, notes }
     * @returns {Promise<Object>}
     */
    createUnifiedPayment: async (data) => {
        return await http.post(`${API_BASE}/unified-payments`, data);
    },

    // ========================================
    // RECEIPTS
    // ========================================

    /**
     * List receipts
     * @param {Object} params - { userType, userId, page, pageSize }
     * @returns {Promise<{ items: Array }>}
     */
    listReceipts: async (params = {}) => {
        return await http.get(`${API_BASE}/receipts`, { params });
    },

    /**
     * Create receipt
     * @param {number} paymentId
     * @returns {Promise<Object>}
     */
    createReceipt: async (paymentId) => {
        return await http.post(`${API_BASE}/receipts`, { paymentId });
    },

    // ========================================
    // OUTSTANDING FEES
    // ========================================

    /**
     * Get outstanding fees
     * @param {Object} params - { userType, page, pageSize }
     * @returns {Promise<{ items: Array }>}
     */
    getOutstandingFees: async (params = {}) => {
        return await http.get(`${API_BASE}/outstanding`, { params });
    },

    // ========================================
    // PAYROLL
    // ========================================

    /**
     * Get payroll summary (teachers + drivers)
     * @param {Object} params - { role, periodMonth, status, page, pageSize }
     * @returns {Promise<{ items: Array, total: number }>}
     */
    getPayrollSummary: async (params = {}) => {
        return await http.get(`${API_BASE}/payroll`, { params });
    },

    // ========================================
    // FINANCIAL RECORD CHECKS
    // ========================================

    /**
     * Check if a user has financial records
     * @param {'student'|'teacher'|'driver'} userType
     * @param {number} userId
     * @returns {Promise<{ hasRecords: boolean }>}
     */
    checkFinancialRecords: async (userType, userId) => {
        return await http.get(`${API_BASE}/check-records/${userType}/${userId}`);
    },
    // ========================================
    // EXPENSES
    // ========================================

    expenses: {
        list: async (params = {}) => {
            return await http.get(`/expenses`, { params });
        },
        getStats: async () => {
            return await http.get(`/expenses/stats`);
        },
        getById: async (id) => {
            return await http.get(`/expenses/${id}`);
        },
        create: async (data) => {
            return await http.post(`/expenses`, data);
        },
        update: async (id, data) => {
            return await http.put(`/expenses/${id}`, data);
        },
        delete: async (id) => {
            return await http.delete(`/expenses/${id}`);
        }
    },
};

// ========================================
// DRIVERS API
// ========================================

const DRIVERS_BASE = '/drivers';

export const driversApi = {
    /**
     * List drivers
     * @param {Object} params - { status, busId, page, pageSize }
     * @returns {Promise<{ items: Array, total: number }>}
     */
    list: async (params = {}) => {
        return await http.get(DRIVERS_BASE, { params });
    },

    /**
     * Get driver by ID
     * @param {number} id
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        return await http.get(`${DRIVERS_BASE}/${id}`);
    },

    /**
     * Create driver
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    create: async (data) => {
        return await http.post(DRIVERS_BASE, data);
    },

    /**
     * Update driver
     * @param {number} id
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    update: async (id, data) => {
        return await http.put(`${DRIVERS_BASE}/${id}`, data);
    },

    /**
     * Delete driver
     * @param {number} id
     * @param {boolean} force - Force delete even if financial records exist
     * @returns {Promise<{ success: boolean } | { hasFinancialRecords: boolean, requiresConfirmation: boolean }>}
     */
    delete: async (id, force = false) => {
        return await http.delete(`${DRIVERS_BASE}/${id}`, { params: { force } });
    },

    /**
     * Get driver payroll
     * @param {number} driverId
     * @param {Object} params - { page, pageSize }
     * @returns {Promise<{ items: Array }>}
     */
    getPayroll: async (driverId, params = {}) => {
        return await http.get(`${DRIVERS_BASE}/${driverId}/payroll`, { params });
    },

    /**
     * Create/update driver payroll
     * @param {number} driverId
     * @param {Object} data - { periodMonth, baseSalary, allowances, deductions, bonuses, notes }
     * @returns {Promise<Object>}
     */
    createPayroll: async (driverId, data) => {
        return await http.post(`${DRIVERS_BASE}/${driverId}/payroll`, data);
    },

    /**
     * Update payroll status
     * @param {number} driverId
     * @param {number} payrollId
     * @param {Object} data - { status, transactionReference }
     * @returns {Promise<Object>}
     */
    updatePayrollStatus: async (driverId, payrollId, data) => {
        return await http.patch(`${DRIVERS_BASE}/${driverId}/payroll/${payrollId}/status`, data);
    },

    deletePayroll: async (driverId, payrollId) => {
        return await http.delete(`${DRIVERS_BASE}/${driverId}/payroll/${payrollId}`);
    },

    /**
     * Get driver count
     * @returns {Promise<{ count: number }>}
     */
    getCount: async () => {
        return await http.get(`${DRIVERS_BASE}/count`);
    },


};

export default financeApi;
