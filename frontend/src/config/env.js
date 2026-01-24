export const config = {
  API_BASE_URL: import.meta?.env?.VITE_API_URL || '',
  TOKEN_STORAGE: import.meta?.env?.VITE_TOKEN_STORAGE || 'session', // 'session' | 'local'
  REQUEST_TIMEOUT_MS: Number(import.meta?.env?.VITE_REQUEST_TIMEOUT_MS || 15000),
  ENABLE_DEMO_AUTH: String(import.meta?.env?.VITE_ENABLE_DEMO_AUTH || 'false') === 'true',
};

export default config;
