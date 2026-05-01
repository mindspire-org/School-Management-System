import { config } from '../config/env';
import { STORAGE_KEYS } from '../utils/constants';

let authToken = null;
let onUnauthorized = null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = typeof handler === 'function' ? handler : null;
};

const withTimeout = (promise, ms) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return {
    exec: (input, init = {}) => {
      return fetch(input, { ...init, signal: controller.signal })
        .finally(() => clearTimeout(id));
    },
  };
};

// If running under Electron, prefer runtime API base injected by preload
// Fallback to VITE_API_URL and then to localhost dev API
const electronBase = (typeof window !== 'undefined' && window.ELECTRON_CONFIG && window.ELECTRON_CONFIG.API_BASE_URL) ||
  (typeof window !== 'undefined' && window.__API_BASE_URL);

const normalizeApiBase = (raw) => {
  const s = String(raw || '').replace(/\/$/, '');
  if (!s) return '';
  if (s.endsWith('/api')) return s;
  // If user provided host only (e.g. http://localhost:59201), ensure /api is included.
  return s + '/api';
};

// In Vite dev, always use relative '/api' so the proxy routes to the correct backend.
// This prevents accidental 404s when VITE_API_URL is set to an old/stale backend.
const baseURL = (
  electronBase ||
  (import.meta?.env?.DEV ? '/api' : (normalizeApiBase(config.API_BASE_URL) || '/api'))
).replace(/\/$/, '');

const getStoredRefreshToken = () => {
  try {
    return (
      localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    );
  } catch (_) {
    return null;
  }
};

const persistNewTokens = ({ token, refreshToken } = {}) => {
  if (!token) return;
  try {
    // Prefer whichever storage currently holds AUTH_TOKEN; fallback to session
    const useLocal = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) != null;
    const primary = useLocal ? localStorage : sessionStorage;
    const secondary = useLocal ? sessionStorage : localStorage;

    primary.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    if (refreshToken) primary.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    // Clear secondary to avoid ambiguity
    secondary.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    secondary.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (_) {}
};

const refreshAccessToken = async () => {
  const rt = getStoredRefreshToken();
  if (!rt) return null;
  const refreshUrl = baseURL + '/auth/refresh';
  const fetcher = withTimeout(null, config.REQUEST_TIMEOUT_MS);
  const res = await fetcher.exec(refreshUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ refreshToken: rt }),
    cache: 'no-store'
  });
  const contentType = res.headers.get('content-type') || '';
  const isJSON = contentType.includes('application/json');
  const payload = isJSON ? await res.json() : await res.text();
  if (!res.ok) {
    const error = new Error(payload?.message || 'Refresh failed');
    error.status = res.status;
    error.data = payload;
    throw error;
  }
  return payload;
};

const request = async (method, url, { params, data, headers, skipUnauthorizedHandler, _retry } = {}) => {
  // Drop undefined/null query params to avoid sending 'undefined' strings
  const cleanedParams = params
    ? Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    )
    : undefined;

  // Prevent stale 304/no-body responses by cache-busting GETs
  let finalParams = cleanedParams ? { ...cleanedParams } : {};
  if (method === 'GET') {
    finalParams._ts = Date.now();
  }

  const qs = Object.keys(finalParams).length > 0
    ? '?' + new URLSearchParams(finalParams).toString()
    : '';
  const fullUrl = baseURL + url + qs;

  const finalHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
    ...(headers || {}),
  };
  if (authToken) finalHeaders['Authorization'] = `Bearer ${authToken}`;

  // Attach campus override if present
  try {
    const selectedCampusId = localStorage.getItem('sms_selected_campus_id');
    if (selectedCampusId) {
      finalHeaders['x-campus-id'] = selectedCampusId;
    }
  } catch (_) { }

  const body = data !== undefined ? JSON.stringify(data) : undefined;

  try {
    const fetcher = withTimeout(null, config.REQUEST_TIMEOUT_MS);
    const res = await fetcher.exec(fullUrl, { method, headers: finalHeaders, body, cache: 'no-store' });

    const contentType = res.headers.get('content-type') || '';
    const isJSON = contentType.includes('application/json');
    const payload = isJSON ? await res.json() : await res.text();

    if (!res.ok) {
      // If access token expired, try refresh once and retry the original request.
      if (res.status === 401 && authToken && !_retry) {
        try {
          const refreshed = await refreshAccessToken();
          const newToken = refreshed?.token || refreshed?.accessToken;
          const newRefresh = refreshed?.refreshToken;
          if (newToken) {
            setAuthToken(newToken);
            persistNewTokens({ token: newToken, refreshToken: newRefresh });
            return await request(method, url, { params, data, headers, skipUnauthorizedHandler, _retry: true });
          }
        } catch (_) {
          // fall through to unauthorized handler
        }
      }

      // Only trigger global 401 handler when a session token exists (i.e., post-login)
      if (res.status === 401 && authToken && onUnauthorized && !skipUnauthorizedHandler) {
        try {
          onUnauthorized({
            status: res.status,
            url,
            method,
            data: payload,
          });
        } catch (_) { }
      }

      const error = new Error(payload?.message || 'Request failed');
      error.status = res.status;
      error.data = payload;
      throw error;
    }

    return payload;
  } catch (err) {
    if (err.name === 'AbortError') {
      const error = new Error('Request timeout');
      error.status = 408;
      throw error;
    }
    throw err;
  }
};

export const http = {
  get: (url, options) => request('GET', url, options),
  post: (url, data, options = {}) => request('POST', url, { ...options, data }),
  put: (url, data, options = {}) => request('PUT', url, { ...options, data }),
  patch: (url, data, options = {}) => request('PATCH', url, { ...options, data }),
  delete: (url, options) => request('DELETE', url, options),
};

export default http;
