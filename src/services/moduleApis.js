import axios from 'axios';
import { STORAGE_KEYS } from '../utils/constants';
import { config } from '../config/env';

let API_URL = (() => {
    const electronBase =
        (typeof window !== 'undefined' && window.ELECTRON_CONFIG && window.ELECTRON_CONFIG.API_BASE_URL) ||
        (typeof window !== 'undefined' && window.__API_BASE_URL);
    let base = String(electronBase || config.API_BASE_URL || import.meta.env.VITE_API_URL || '/api');
    base = base.replace(/\/$/, '');
    if (base !== '/api' && !/\/api$/.test(base)) base = base + '/api';
    return base;
})();

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token =
        localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
        sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
        localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const selectedCampusId = localStorage.getItem(STORAGE_KEYS.SELECTED_CAMPUS_ID);
    if (selectedCampusId) config.headers['x-campus-id'] = selectedCampusId;

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

const toNumberOrNull = (v) => {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
};

const normalizeCampusId = (params = {}, data = {}) => {
    const fromParams = params?.campusId;
    const fromData = data?.campusId;
    return fromData ?? fromParams ?? null;
};

const readCollection = (storageKey) => {
    try {
        const raw = localStorage.getItem(storageKey);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];

        let changed = false;
        const existingNumericIds = new Set(
            parsed
                .map((it) => toNumberOrNull(it?.id))
                .filter((n) => n != null)
        );
        let nextId = existingNumericIds.size ? Math.max(...existingNumericIds) + 1 : 1;

        const normalized = parsed.map((it) => {
            const hasId = it?.id !== undefined && it?.id !== null && String(it?.id).trim() !== '';
            if (hasId) return it;

            changed = true;
            const assigned = nextId++;
            existingNumericIds.add(assigned);
            return { ...it, id: assigned };
        });

        if (changed) writeCollection(storageKey, normalized);
        return normalized;
    } catch (_) {
        return [];
    }
};

const writeCollection = (storageKey, items) => {
    localStorage.setItem(storageKey, JSON.stringify(items || []));
};

const makeId = (items) => {
    const max = (items || []).reduce((m, it) => {
        const n = toNumberOrNull(it?.id);
        return n != null && n > m ? n : m;
    }, 0);
    return max + 1;
};

const createLocalStorageCRUDApi = (storageKey) => ({
    list: async (params = {}) => {
        const campusId = normalizeCampusId(params);
        const items = readCollection(storageKey);
        if (!campusId) return items;
        return items.filter((it) => String(it?.campusId) === String(campusId));
    },
    get: async (id) => {
        const items = readCollection(storageKey);
        const item = items.find((it) => String(it?.id) === String(id));
        if (!item) throw new Error('Not found');
        return item;
    },
    create: async (data) => {
        const campusId = normalizeCampusId({}, data);
        const items = readCollection(storageKey);
        const rawId = data?.id;
        const normalizedId = rawId === undefined || rawId === null || String(rawId).trim() === '' ? null : rawId;
        const id = normalizedId ?? makeId(items);
        const next = { ...data, id, ...(campusId ? { campusId } : {}) };
        writeCollection(storageKey, [...items, next]);
        return next;
    },
    update: async (id, data) => {
        const campusId = normalizeCampusId({}, data);
        const items = readCollection(storageKey);
        const idx = items.findIndex((it) => String(it?.id) === String(id));
        if (idx === -1) throw new Error('Not found');
        const next = { ...items[idx], ...data, id: items[idx].id, ...(campusId ? { campusId } : {}) };
        items[idx] = next;
        writeCollection(storageKey, items);
        return next;
    },
    delete: async (id) => {
        const items = readCollection(storageKey);
        const idx = items.findIndex((it) => String(it?.id) === String(id));
        if (idx === -1) throw new Error('Not found');
        items.splice(idx, 1);
        writeCollection(storageKey, items);
        return { message: 'Deleted successfully' };
    },
});

const productStorageKey = 'inventory.products';

const adjustProductQty = ({ productId, delta, campusId }) => {
    if (!delta) return;
    const items = readCollection(productStorageKey);
    const idx = items.findIndex((p) => String(p?.id) === String(productId));
    if (idx === -1) throw new Error('Product not found');
    if (campusId && String(items[idx]?.campusId) !== String(campusId)) throw new Error('Product campus mismatch');
    const current = Number(items[idx]?.quantity || 0);
    const next = current + Number(delta);
    if (next < 0) throw new Error('Insufficient stock');
    items[idx] = { ...items[idx], quantity: next };
    writeCollection(productStorageKey, items);
};

const purchaseEffect = (p) => (p?.status === 'Completed' ? Number(p?.quantity || 0) : 0);
const saleEffect = (s) => (s?.status === 'Paid' ? -Number(s?.quantity || 0) : 0);
const issueEffect = (i) => (i?.status === 'Issued' ? -Number(i?.quantity || 0) : 0);

const createLocalTxnApi = ({ storageKey, effectFor }) => {
    const base = createLocalStorageCRUDApi(storageKey);
    return {
        ...base,
        create: async (data) => {
            const campusId = normalizeCampusId({}, data);
            const created = await base.create({ ...data, ...(campusId ? { campusId } : {}) });
            adjustProductQty({ productId: created.productId, delta: effectFor(created), campusId });
            return created;
        },
        update: async (id, data) => {
            const campusId = normalizeCampusId({}, data);
            const existing = await base.get(id);
            adjustProductQty({ productId: existing.productId, delta: -effectFor(existing), campusId: campusId ?? existing.campusId });
            const updated = await base.update(id, { ...data, ...(campusId ? { campusId } : {}) });
            adjustProductQty({ productId: updated.productId, delta: effectFor(updated), campusId: campusId ?? updated.campusId });
            return updated;
        },
        delete: async (id) => {
            const existing = await base.get(id);
            adjustProductQty({ productId: existing.productId, delta: -effectFor(existing), campusId: existing.campusId });
            return base.delete(id);
        },
    };
};

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
export const employeeApi = createCRUDApi('/teachers');

export const hrEmployeesApi = {
    list: async (params = {}) => {
        const response = await apiClient.get('/hr/employees', { params });
        return response.data;
    },
    get: async (id, params = {}) => {
        const response = await apiClient.get(`/hr/employees/${id}`, { params });
        return response.data;
    },
};

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
export const eventsApi = createCRUDApi('/events-certificates/events');

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
