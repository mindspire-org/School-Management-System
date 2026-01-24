import { config } from '../config/env';

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

// If VITE_API_URL is not set, default to the backend dev URL
const baseURL = (config.API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const request = async (method, url, { params, data, headers } = {}) => {
  // Drop undefined/null query params to avoid sending 'undefined' strings
  const cleanedParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
      )
    : undefined;
  const qs = cleanedParams && Object.keys(cleanedParams).length > 0
    ? '?' + new URLSearchParams(cleanedParams).toString()
    : '';
  const fullUrl = baseURL + url + qs;

  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(headers || {}),
  };
  if (authToken) finalHeaders['Authorization'] = `Bearer ${authToken}`;

  // Campus scoping (admin/owner supported by backend via x-campus-id)
  if (!('x-campus-id' in finalHeaders) && !('X-Campus-Id' in finalHeaders)) {
    const storedCampusId =
      sessionStorage.getItem('sms_campus_id') ||
      localStorage.getItem('sms_campus_id');
    if (storedCampusId) finalHeaders['x-campus-id'] = storedCampusId;
  }

  const body = data !== undefined ? JSON.stringify(data) : undefined;

  try {
    const fetcher = withTimeout(null, config.REQUEST_TIMEOUT_MS);
    const res = await fetcher.exec(fullUrl, { method, headers: finalHeaders, body });

    const contentType = res.headers.get('content-type') || '';
    const isJSON = contentType.includes('application/json');
    const payload = isJSON ? await res.json() : await res.text();

    if (!res.ok) {
      if (res.status === 401 && onUnauthorized) onUnauthorized();
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
