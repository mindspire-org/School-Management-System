import { http } from '../http';

// Dashboard summary
export const getDashboard = (params) => http.get('/finance/dashboard', { params });

// Invoice APIs (student-specific)
export const listInvoices = (params) => http.get('/finance/invoices', { params });
export const getInvoiceById = (id) => http.get(`/finance/invoices/${id}`);
export const createInvoice = (data) => http.post('/finance/invoices', data);
export const updateInvoice = (id, data) => http.put(`/finance/invoices/${id}`, data);
export const deleteInvoice = (id) => http.delete(`/finance/invoices/${id}`);
export const listInvoicePayments = (id) => http.get(`/finance/invoices/${id}/payments`);
export const addInvoicePayment = (id, data) => http.post(`/finance/invoices/${id}/payments`, data);

// Payroll APIs (teachers and drivers)
export const listPayroll = (params) => http.get('/finance/payroll', { params });
export const getPayrollById = (id) => http.get(`/finance/payroll/${id}`);
export const createPayroll = (data) => http.post('/finance/payroll', data);
export const updatePayroll = (id, data) => http.put(`/finance/payroll/${id}`, data);
export const deletePayroll = (id) => http.delete(`/finance/payroll/${id}`);

// Expense APIs (teachers and drivers)
export const listExpenses = (params) => http.get('/finance/expenses', { params });
export const getExpenseById = (id) => http.get(`/finance/expenses/${id}`);
export const createExpense = (data) => http.post('/finance/expenses', data);
export const updateExpense = (id, data) => http.put(`/finance/expenses/${id}`, data);
export const deleteExpense = (id) => http.delete(`/finance/expenses/${id}`);

// Payment APIs (students/teachers/drivers)
export const listPayments = (params) => http.get('/finance/payments', { params });
export const getPaymentById = (id) => http.get(`/finance/payments/${id}`);
export const createPayment = (data) => http.post('/finance/payments', data);
export const updatePayment = (id, data) => http.put(`/finance/payments/${id}`, data);
export const deletePayment = (id) => http.delete(`/finance/payments/${id}`);

// Receipt APIs
export const listReceipts = (params) => http.get('/finance/receipts', { params });
export const getReceiptById = (id) => http.get(`/finance/receipts/${id}`);
export const createReceipt = (data) => http.post('/finance/receipts', data);
export const updateReceipt = (id, data) => http.put(`/finance/receipts/${id}`, data);
export const deleteReceipt = (id) => http.delete(`/finance/receipts/${id}`);

// Reports APIs
export const listReports = (params) => http.get('/finance/reports', { params });
export const generateReport = (data) => http.post('/finance/reports', data);

// Outstanding fees and related operations
export const listOutstandingFees = (params) => http.get('/finance/outstanding-fees', { params });
export const createReminder = (data) => http.post('/finance/reminders', data);
export const generatePaymentPlan = (data) => http.post('/finance/payment-plans', data);
export const applyFines = (data) => http.post('/finance/fines/apply', data);
