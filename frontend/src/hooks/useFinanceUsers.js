import { useState, useEffect, useCallback } from 'react';
import { financeApi } from '../services/financeApi';

/**
 * Hook to manage finance user data and existence checks
 * @returns {Object} User state and helper functions
 */
export function useFinanceUsers() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasUsers, setHasUsers] = useState(false);
    const [counts, setCounts] = useState({ students: 0, teachers: 0, drivers: 0 });
    const [usersByType, setUsersByType] = useState({
        student: [],
        teacher: [],
        driver: [],
    });

    // Check if users exist on mount
    useEffect(() => {
        checkUsers();
    }, []);

    const checkUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await financeApi.checkUsersExist();
            setHasUsers(Boolean(data?.hasUsers));
            setCounts(
                data && typeof data.counts === 'object' && data.counts !== null
                    ? data.counts
                    : { students: 0, teachers: 0, drivers: 0 }
            );
        } catch (e) {
            setError(e.message || 'Failed to check users');
            console.error('Failed to check users:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch users by type (cached)
    const fetchUsersByType = useCallback(async (type) => {
        if (!type) return [];

        // Return cached if available
        if (usersByType[type]?.length > 0) {
            return usersByType[type];
        }

        try {
            const data = await financeApi.getUsersByType(type);
            const users = data.items || [];
            setUsersByType(prev => ({ ...prev, [type]: users }));
            return users;
        } catch (e) {
            console.error(`Failed to fetch ${type}s:`, e);
            return [];
        }
    }, [usersByType]);

    // Clear cache for a specific type
    const clearCache = useCallback((type) => {
        if (type) {
            setUsersByType(prev => ({ ...prev, [type]: [] }));
        } else {
            setUsersByType({ student: [], teacher: [], driver: [] });
        }
    }, []);

    // Refresh everything
    const refresh = useCallback(async () => {
        clearCache();
        await checkUsers();
    }, [checkUsers, clearCache]);

    // Get available user types (those with count > 0)
    const safeCounts = counts && typeof counts === 'object'
        ? counts
        : { students: 0, teachers: 0, drivers: 0 };
    const availableTypes = Object.entries(safeCounts)
        .filter(([_, count]) => count > 0)
        .map(([type]) => type.replace('s', '')); // Remove plural

    return {
        loading,
        error,
        hasUsers,
        counts,
        availableTypes,
        fetchUsersByType,
        checkUsers,
        clearCache,
        refresh,
    };
}

/**
 * Hook for dashboard statistics
 */
export function useDashboardStats(initialParams = {}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [params, setParams] = useState(initialParams);

    const fetchStats = useCallback(async (newParams) => {
        const p = newParams || params;
        setLoading(true);
        setError(null);
        try {
            const data = await financeApi.getDashboardStats(p);
            setStats(data);
        } catch (e) {
            setError(e.message || 'Failed to fetch stats');
            console.error('Failed to fetch dashboard stats:', e);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchStats();
    }, [params]);

    const updateParams = useCallback((newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    }, []);

    return { loading, error, stats, params, updateParams, refresh: fetchStats };
}

export function useDashboardAnalytics(initialParams = {}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [params, setParams] = useState(initialParams);

    const fetchAnalytics = useCallback(async (newParams) => {
        const p = newParams || params;
        setLoading(true);
        setError(null);
        try {
            const data = await financeApi.getDashboardAnalytics(p);
            setAnalytics(data);
        } catch (e) {
            setError(e.message || 'Failed to fetch dashboard analytics');
            console.error('Failed to fetch dashboard analytics:', e);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchAnalytics();
    }, [params]);

    const updateParams = useCallback((newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    }, []);

    return { loading, error, analytics, params, updateParams, refresh: fetchAnalytics };
}

/**
 * Hook for unified invoices
 */
export function useUnifiedInvoices(initialParams = {}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [total, setTotal] = useState(0);
    const [params, setParams] = useState(initialParams);

    const fetchInvoices = useCallback(async (newParams) => {
        const p = newParams || params;
        setLoading(true);
        setError(null);
        try {
            const data = await financeApi.listUnifiedInvoices(p);
            setInvoices(data.items || []);
            setTotal(data.total || 0);
        } catch (e) {
            setError(e.message || 'Failed to fetch invoices');
            console.error('Failed to fetch invoices:', e);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchInvoices();
    }, [params]);

    const updateParams = useCallback((newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    }, []);

    return {
        loading,
        error,
        invoices,
        total,
        params,
        updateParams,
        refresh: fetchInvoices,
    };
}

/**
 * Hook for unified payments
 */
export function useUnifiedPayments(initialParams = {}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payments, setPayments] = useState([]);
    const [params, setParams] = useState(initialParams);

    const fetchPayments = useCallback(async (newParams) => {
        const p = newParams || params;
        setLoading(true);
        setError(null);
        try {
            const data = await financeApi.listUnifiedPayments(p);
            setPayments(data.items || []);
        } catch (e) {
            setError(e.message || 'Failed to fetch payments');
            console.error('Failed to fetch payments:', e);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchPayments();
    }, [params]);

    const updateParams = useCallback((newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    }, []);

    return {
        loading,
        error,
        payments,
        params,
        updateParams,
        refresh: fetchPayments,
    };
}

/**
 * Hook for receipts
 */
export function useReceipts(initialParams = {}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [receipts, setReceipts] = useState([]);
    const [params, setParams] = useState(initialParams);

    const fetchReceipts = useCallback(async (newParams) => {
        const p = newParams || params;
        setLoading(true);
        setError(null);
        try {
            const data = await financeApi.listReceipts(p);
            setReceipts(data.items || []);
        } catch (e) {
            setError(e.message || 'Failed to fetch receipts');
            console.error('Failed to fetch receipts:', e);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchReceipts();
    }, [params]);

    const updateParams = useCallback((newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    }, []);

    return {
        loading,
        error,
        receipts,
        params,
        updateParams,
        refresh: fetchReceipts,
    };
}

/**
 * Hook for outstanding fees
 */
export function useOutstandingFees(initialParams = {}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [outstanding, setOutstanding] = useState([]);
    const [params, setParams] = useState(initialParams);

    const fetchOutstanding = useCallback(async (newParams) => {
        const p = newParams || params;
        setLoading(true);
        setError(null);
        try {
            const data = await financeApi.getOutstandingFees(p);
            setOutstanding(data.items || []);
        } catch (e) {
            setError(e.message || 'Failed to fetch outstanding fees');
            console.error('Failed to fetch outstanding fees:', e);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchOutstanding();
    }, [params]);

    const updateParams = useCallback((newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    }, []);

    return {
        loading,
        error,
        outstanding,
        params,
        updateParams,
        refresh: fetchOutstanding,
    };
}

/**
 * Hook for payroll summary
 */
export function usePayrollSummary(initialParams = {}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payroll, setPayroll] = useState([]);
    const [total, setTotal] = useState(0);
    const [params, setParams] = useState(initialParams);

    const fetchPayroll = useCallback(async (newParams) => {
        const p = newParams || params;
        setLoading(true);
        setError(null);
        try {
            const data = await financeApi.getPayrollSummary(p);
            setPayroll(data.items || []);
            setTotal(data.total || 0);
        } catch (e) {
            setError(e.message || 'Failed to fetch payroll');
            console.error('Failed to fetch payroll:', e);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchPayroll();
    }, [params]);

    const updateParams = useCallback((newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    }, []);

    return {
        loading,
        error,
        payroll,
        total,
        params,
        updateParams,
        refresh: fetchPayroll,
    };
}

export default useFinanceUsers;
