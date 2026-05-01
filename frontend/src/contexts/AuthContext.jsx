import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../utils/constants';
import { getDashboardPath } from '../utils/sidebarConfig';
import { authApi, rbacApi, setAuthToken, setUnauthorizedHandler } from '../services/api';
import { config } from '../config/env';
import { getPrimaryStorage, getSecondaryStorage } from '../utils/storage';

// Create the Auth Context
const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
  login: () => { },
  logout: () => { },
  updateUser: () => { },
  moduleAccess: null,
  refreshModuleAccess: () => { },
  campusId: null,
});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [moduleAccess, setModuleAccess] = useState(null);
  const [selectedCampusId, setSelectedCampusId] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CAMPUS_ID) || null;
  });
  const navigate = useNavigate();
  const unauthorizedSeq = useRef(0);
  const lastUnauthorizedAt = useRef(0);

  const setCampusId = useCallback((id) => {
    const cid = id ? String(id) : null;
    setSelectedCampusId(cid);
    if (cid) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_CAMPUS_ID, cid);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_CAMPUS_ID);
    }
  }, []);

  // Logout function
  const logout = useCallback(async ({ skipRemote = false } = {}) => {
    try {
      // Best-effort server logout unless explicitly skipped
      if (!skipRemote) {
        await authApi.logout();
      }
    } catch (_) { }
    // Clear both storages to fully sign out
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_CAMPUS_ID);
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setSelectedCampusId(null);
    navigate('/auth/sign-in');
  }, [navigate]);

  const refreshModuleAccess = useCallback(async (role) => {
    try {
      if (!role) { setModuleAccess({ allowModules: [], allowSubroutes: [] }); return; }
      if (role === 'owner' || role === 'parent' || role === 'branch_admin') { setModuleAccess({ allowModules: 'ALL', allowSubroutes: 'ALL' }); return; }
      const a = await rbacApi.getMyModules();
      setModuleAccess(a || { allowModules: [], allowSubroutes: [] });
    } catch (_) {
      // Keep previous module access if available; otherwise default to allow-all.
      // This avoids blank screens on refresh when RBAC endpoint is temporarily unavailable.
      setModuleAccess((prev) => prev || { allowModules: 'ALL', allowSubroutes: 'ALL' });
    }
  }, []);

  const handleUnauthorized = useCallback(async (ctx = {}) => {
    try {
      const now = Date.now();
      if (now - lastUnauthorizedAt.current < 800) return;
      lastUnauthorizedAt.current = now;

      const url = String(ctx?.url || '');

      // If auth endpoints say unauthorized, the session is invalid.
      if (url.startsWith('/auth/')) {
        logout({ skipRemote: true });
        return;
      }

      const seq = (unauthorizedSeq.current += 1);

      // Verify session before forcing logout.
      // This prevents random redirects when a non-auth endpoint returns 401 due to role/permissions.
      try {
        const fresh = await authApi.profileSafe({ skipUnauthorizedHandler: true });
        if (seq !== unauthorizedSeq.current) return;
        const userData = fresh?.user || null;
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          await refreshModuleAccess(userData.role);
          return;
        }
      } catch (e) {
        if (seq !== unauthorizedSeq.current) return;
        const status = e?.status;
        if (status === 401 || status === 403) {
          logout({ skipRemote: true });
          return;
        }
      }
    } catch (_) {
      // ignore
    }
  }, [logout, refreshModuleAccess]);

  // Initialize auth on mount: load token from storage, validate profile, set 401 handler
  useEffect(() => {
    const initAuth = async () => {
      try {
        const primary = getPrimaryStorage(config.TOKEN_STORAGE);
        const secondary = getSecondaryStorage(config.TOKEN_STORAGE);

        // Try primary first, fallback to secondary
        let token = primary.getItem(STORAGE_KEYS.AUTH_TOKEN) || secondary.getItem(STORAGE_KEYS.AUTH_TOKEN);
        let storedUser = primary.getItem(STORAGE_KEYS.USER_DATA) || secondary.getItem(STORAGE_KEYS.USER_DATA);

        if (token) setAuthToken(token);

        let parsedUser = null;
        if (storedUser) {
          try {
            parsedUser = JSON.parse(storedUser);
          } catch (_) {
            parsedUser = null;
          }
        }

        // Optimistically restore session from storage to prevent blank screens on refresh.
        // We'll validate with /auth/profile when possible and only clear session on explicit 401/403.
        if (token && parsedUser) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          await refreshModuleAccess(parsedUser.role);
        }

        if (token && !config.ENABLE_DEMO_AUTH) {
          try {
            const fresh = await authApi.profileSafe({ skipUnauthorizedHandler: true });
            const userData = fresh?.user || parsedUser;
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
              await refreshModuleAccess(userData.role);
            }
          } catch (e) {
            const status = e?.status;
            // Invalid token -> clear and reset
            if (status === 401 || status === 403) {
              primary.removeItem(STORAGE_KEYS.AUTH_TOKEN);
              primary.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              primary.removeItem(STORAGE_KEYS.USER_DATA);
              secondary.removeItem(STORAGE_KEYS.AUTH_TOKEN);
              secondary.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              secondary.removeItem(STORAGE_KEYS.USER_DATA);
              setAuthToken(null);
              setUser(null);
              setIsAuthenticated(false);
              setModuleAccess(null);
            }
          }
        }
      } catch (e) {
        console.error('Error initializing auth:', e);
        // hard reset storages on init failure
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    setUnauthorizedHandler(handleUnauthorized);

    initAuth();
    return () => setUnauthorizedHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleUnauthorized]);

  useEffect(() => {
    if (!user?.role) return;

    const refresh = () => {
      refreshModuleAccess(user.role);
    };

    const onFocus = () => refresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    const timer = setInterval(refresh, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(timer);
    };
  }, [user?.role, refreshModuleAccess]);

  // Login function
  const login = useCallback(async (email, password, remember = false, ownerKey) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) throw new Error('Email and password are required');

      let token;
      let refreshToken;
      let userData;

      // Demo-auth fallback when enabled
      if (config.ENABLE_DEMO_AUTH) {
        const roleFromEmail =
          email.includes('admin@') ? 'admin' :
            email.includes('teacher@') ? 'teacher' :
              email.includes('student@') ? 'student' :
                email.includes('driver@') ? 'driver' :
                  email.includes('parent@') ? 'parent' :
                    email.includes('@mindspire.org') ? 'owner' : 'student';
        token = 'demo-token-' + Date.now();
        userData = { email, role: roleFromEmail, name: roleFromEmail.toUpperCase(), id: roleFromEmail + '-001' };
      } else {
        // Real backend login; detect if identifier is username vs email/phone
        const id = String(email).trim();
        const emailRegex = /.+@.+\..+/;
        const phoneRegex = /^\+?\d{10,15}$|^0\d{10}$|^3\d{9}$/;
        const looksEmailOrPhone = emailRegex.test(id) || phoneRegex.test(id);
        const res = await authApi.login({ email: looksEmailOrPhone ? id : undefined, username: looksEmailOrPhone ? undefined : id, password, ownerKey });
        token = res?.token || res?.accessToken;
        refreshToken = res?.refreshToken;
        userData = res?.user || null;
        if (!token || !userData) throw new Error('Invalid auth response');
      }

      setAuthToken(token);
      const primary = remember ? localStorage : getPrimaryStorage(config.TOKEN_STORAGE);
      const secondary = remember ? sessionStorage : getSecondaryStorage(config.TOKEN_STORAGE);

      // Persist token/user in chosen storage and clear the other to avoid ambiguity
      primary.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      if (typeof refreshToken === 'string' && refreshToken) {
        primary.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      primary.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      secondary.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      secondary.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      secondary.removeItem(STORAGE_KEYS.USER_DATA);

      // Automatically set the selected campus to the user's assigned campus upon login
      if (userData.campusId || userData.campus_id) {
        const cid = String(userData.campusId || userData.campus_id);
        setSelectedCampusId(cid);
        localStorage.setItem(STORAGE_KEYS.SELECTED_CAMPUS_ID, cid);
        console.log('AuthContext: Selected campus set to', cid);
      }

      setUser(userData);
      setIsAuthenticated(true);

      const dashboardPath = getDashboardPath(userData.role);
      navigate(dashboardPath);
      await refreshModuleAccess(userData.role);
      return { success: true, user: userData };
    } catch (e) {
      setError(e.message || 'Login failed');
      return { success: false, error: e.message || 'Login failed', status: e.status, data: e.data };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Update user function
  const updateUser = useCallback((updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    // Write to whichever storage currently holds user
    const ls = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    const ss = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (ls !== null) localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    if (ss !== null) sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
  }, [user]);

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    logout,
    updateUser,
    clearError,
    moduleAccess,
    refreshModuleAccess,
    campusId: selectedCampusId || user?.campusId || user?.campus_id || null,
    setCampusId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Export the context for rare cases where direct access is needed
export default AuthContext;
