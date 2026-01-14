import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as classesApi from '../services/api/classes';

export default function useClassOptions({ includeArchived = false, selectedClass = null } = {}) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Do not filter by status by default; return all classes (pageSize must be <= 200 per backend validator)
      const params = { page: 1, pageSize: 200 };
      const payload = await classesApi.list(params);
      const rows = Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload) ? payload : []);
      setClasses(rows || []);
    } catch (e) {
      setError(e);
      setRetryCount((c) => c + 1);
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    fetchClasses();
  }, [fetchClasses, isAuthenticated, authLoading]);

  // Light retry in case auth token initializes slightly after mount
  useEffect(() => {
    if (retryCount >= 3) return;
    if (!loading && !authLoading && isAuthenticated && (error || (classes && classes.length === 0))) {
      const id = setTimeout(() => {
        fetchClasses();
      }, 800 * (retryCount + 1));
      return () => clearTimeout(id);
    }
  }, [classes, error, loading, retryCount, fetchClasses, isAuthenticated, authLoading]);

  const classOptions = useMemo(() => {
    const set = new Set();
    (classes || []).forEach((c) => {
      const name = c.className || c.class_name || c.name || '';
      if (name) set.add(name);
    });
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }, [classes]);

  const sectionsByClass = useMemo(() => {
    const map = new Map();
    (classes || []).forEach((c) => {
      const name = c.className || c.class_name || c.name || '';
      const section = c.section || c.sectionName || '';
      if (!name || !section) return;
      if (!map.has(name)) map.set(name, new Set());
      map.get(name).add(section);
    });
    const out = {};
    for (const [k, v] of map.entries()) out[k] = Array.from(v).sort();
    return out;
  }, [classes]);

  const sectionOptions = useMemo(() => {
    if (!selectedClass) {
      const set = new Set();
      Object.values(sectionsByClass).forEach((arr) => arr.forEach((s) => set.add(s)));
      return Array.from(set).sort();
    }
    return sectionsByClass[selectedClass] || [];
  }, [selectedClass, sectionsByClass]);

  return {
    classes,
    classOptions,
    sectionOptions,
    sectionsByClass,
    loading,
    error,
    refresh: fetchClasses,
  };
}
