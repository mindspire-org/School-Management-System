import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../utils/constants';
import { getDashboardPath } from '../utils/sidebarConfig';
import { authApi, setAuthToken, setUnauthorizedHandler } from '../services/api';
import { config } from '../config/env';
import { getPrimaryStorage, getSecondaryStorage } from '../utils/storage';

// Create the Auth Context
const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Logout function
  const logout = useCallback(async ({ skipRemote = false } = {}) => {
    try {
      // Best-effort server logout unless explicitly skipped
      if (!skipRemote) {
        await authApi.logout();
      }
    } catch (_) {}
    // Clear both storages to fully sign out
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/auth/sign-in');
  }, [navigate]);

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

        if (token && storedUser) {
          try {
            // When not in demo mode, validate token by fetching profile
            if (!config.ENABLE_DEMO_AUTH) {
              const fresh = await authApi.profile();
              const userData = fresh?.user || JSON.parse(storedUser);
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              // Demo mode: trust stored user
              setUser(JSON.parse(storedUser));
              setIsAuthenticated(true);
            }
          } catch (e) {
            // Invalid token -> clear and reset
            primary.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            primary.removeItem(STORAGE_KEYS.USER_DATA);
            secondary.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            secondary.removeItem(STORAGE_KEYS.USER_DATA);
            setAuthToken(null);
          }
        }
      } catch (e) {
        console.error('Error initializing auth:', e);
        // hard reset storages on init failure
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    // Global 401 handler: clear local session and redirect to sign-in without calling server
    const handleUnauthorized = () => {
      logout({ skipRemote: true });
    };
    setUnauthorizedHandler(handleUnauthorized);

    initAuth();
    return () => setUnauthorizedHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout]);

  // Login function
  const login = useCallback(async (email, password, remember = false) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) throw new Error('Email and password are required');

      let token;
      let userData;

      // Demo-auth fallback when enabled
      if (config.ENABLE_DEMO_AUTH) {
        const roleFromEmail =
          email.includes('admin@') ? 'admin' :
          email.includes('teacher@') ? 'teacher' :
          email.includes('student@') ? 'student' :
          email.includes('driver@') ? 'driver' : 'student';
        token = 'demo-token-' + Date.now();
        userData = { email, role: roleFromEmail, name: roleFromEmail.toUpperCase(), id: roleFromEmail + '-001' };
      } else {
        // Real backend login
        const res = await authApi.login({ email, password });
        token = res?.token || res?.accessToken;
        userData = res?.user || null;
        if (!token || !userData) throw new Error('Invalid auth response');
      }

      setAuthToken(token);
      const primary = remember ? localStorage : getPrimaryStorage(config.TOKEN_STORAGE);
      const secondary = remember ? sessionStorage : getSecondaryStorage(config.TOKEN_STORAGE);

      // Persist token/user in chosen storage and clear the other to avoid ambiguity
      primary.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      primary.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      secondary.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      secondary.removeItem(STORAGE_KEYS.USER_DATA);

      setUser(userData);
      setIsAuthenticated(true);

      const dashboardPath = getDashboardPath(userData.role);
      navigate(dashboardPath);
      return { success: true, user: userData };
    } catch (e) {
      setError(e.message || 'Login failed');
      return { success: false, error: e.message || 'Login failed' };
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

  const value = { user, loading, isAuthenticated, error, login, logout, updateUser, clearError };

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
