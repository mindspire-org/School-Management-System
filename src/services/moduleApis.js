import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Generic CRUD operations factory
const createCRUDApi = (endpoint) => ({
    list: async (params = {}) => {
        const response = await apiClient.get(endpoint, { params });
        return response.data;
    },

    get: async (id) => {
        const response = await apiClient.get(`${endpoint}/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post(endpoint, data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`${endpoint}/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`${endpoint}/${id}`);
        return response.data;
    },
});

// Inventory APIs
export const productApi = createCRUDApi('/inventory/products');
export const categoryApi = createCRUDApi('/inventory/categories');
export const storeApi = createCRUDApi('/inventory/stores');
export const supplierApi = createCRUDApi('/inventory/suppliers');
export const unitApi = createCRUDApi('/inventory/units');
export const purchaseApi = createCRUDApi('/inventory/purchases');
export const saleApi = createCRUDApi('/inventory/sales');
export const issueApi = createCRUDApi('/inventory/issues');

// Academic APIs
export const studentApi = createCRUDApi('/students');

// HR APIs (General)
export const employeeApi = createCRUDApi('/hr/employees');

// Reception APIs
export const admissionEnquiryApi = createCRUDApi('/reception/admission-enquiries');
export const postalRecordApi = createCRUDApi('/reception/postal-records');
export const callLogApi = createCRUDApi('/reception/call-logs');
export const visitorLogApi = createCRUDApi('/reception/visitor-logs');
export const complaintApi = createCRUDApi('/reception/complaints');
export const receptionConfigApi = createCRUDApi('/reception/reception-configs');

// Card Management APIs
export const idCardTemplateApi = createCRUDApi('/card-management/id-card-templates');
export const generatedIdCardApi = createCRUDApi('/card-management/generated-id-cards');
export const admitCardTemplateApi = createCRUDApi('/card-management/admit-card-templates');
export const generatedAdmitCardApi = createCRUDApi('/card-management/generated-admit-cards');

// Events APIs
export const eventsApi = createCRUDApi('/events');

// Certificate APIs
export const certificateTemplateApi = createCRUDApi('/certificates/templates');
export const studentCertificateApi = createCRUDApi('/certificates/students');
export const employeeCertificateApi = createCRUDApi('/certificates/employees');

// Events & Certificates APIs
export const eventApi = createCRUDApi('/events-certificates/events');
export const certificateApi = createCRUDApi('/events-certificates/certificates');
export const qrAttendanceApi = createCRUDApi('/events-certificates/qr-attendance');

// HR APIs
export const payrollApi = {
    ...createCRUDApi('/hr/payroll'),
    generatePayroll: async (month, year, campusId) => {
        const response = await apiClient.post('/hr/payroll/generate', { month, year, campusId });
        return response.data;
    },
    getSalarySlip: async (id) => {
        const response = await apiClient.get(`/hr/payroll/${id}/slip`);
        return response.data;
    },
};

export const advanceSalaryApi = {
    ...createCRUDApi('/hr/advance-salary'),
    approve: async (id) => {
        const response = await apiClient.post(`/hr/advance-salary/${id}/approve`);
        return response.data;
    },
    reject: async (id, reason) => {
        const response = await apiClient.post(`/hr/advance-salary/${id}/reject`, { reason });
        return response.data;
    },
};

export const leaveApi = {
    ...createCRUDApi('/hr/leave'),
    approve: async (id) => {
        const response = await apiClient.post(`/hr/leave/${id}/approve`);
        return response.data;
    },
    reject: async (id, reason) => {
        const response = await apiClient.post(`/hr/leave/${id}/reject`, { reason });
        return response.data;
    },
    getBalance: async (employeeId) => {
        const response = await apiClient.get(`/hr/leave/balance/${employeeId}`);
        return response.data;
    },
};

export const awardApi = createCRUDApi('/hr/awards');

// Reports APIs
export const reportsApi = {
    student: {
        attendance: async (params) => {
            const response = await apiClient.get('/reports/student/attendance', { params });
            return response.data;
        },
        performance: async (params) => {
            const response = await apiClient.get('/reports/student/performance', { params });
            return response.data;
        },
    },
    fees: {
        collection: async (params) => {
            const response = await apiClient.get('/reports/fees/collection', { params });
            return response.data;
        },
        outstanding: async (params) => {
            const response = await apiClient.get('/reports/fees/outstanding', { params });
            return response.data;
        },
    },
    financial: {
        income: async (params) => {
            const response = await apiClient.get('/reports/financial/income', { params });
            return response.data;
        },
        expense: async (params) => {
            const response = await apiClient.get('/reports/financial/expense', { params });
            return response.data;
        },
    },
    attendance: {
        daily: async (params) => {
            const response = await apiClient.get('/reports/attendance/daily', { params });
            return response.data;
        },
        monthly: async (params) => {
            const response = await apiClient.get('/reports/attendance/monthly', { params });
            return response.data;
        },
    },
    hr: {
        employee: async (params) => {
            const response = await apiClient.get('/reports/hr/employee', { params });
            return response.data;
        },
        salary: async (params) => {
            const response = await apiClient.get('/reports/hr/salary', { params });
            return response.data;
        },
    },
    examination: {
        results: async (params) => {
            const response = await apiClient.get('/reports/exam/results', { params });
            return response.data;
        },
        grades: async (params) => {
            const response = await apiClient.get('/reports/exam/grades', { params });
            return response.data;
        },
    },
    inventory: {
        stock: async (params) => {
            const response = await apiClient.get('/reports/inventory/stock', { params });
            return response.data;
        },
        purchase: async (params) => {
            const response = await apiClient.get('/reports/inventory/purchase', { params });
            return response.data;
        },
    },
};

export default apiClient;
