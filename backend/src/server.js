import http from 'http';
import app from './app.js';
import { loadEnv } from './config/env.js';
import * as authService from './services/auth.service.js';

loadEnv();

// Use a stable default port for Electron packaging
const DEFAULT_PORT = 59201;
let port = Number(process.env.PORT) || DEFAULT_PORT;

async function boot() {
  // Seed or ensure Owner account exists BEFORE starting server to avoid race
  try {
    const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
    const ownerPassword = process.env.OWNER_PASSWORD || 'Qutaibah@123';
    const ownerName = process.env.OWNER_NAME || 'Mindspire Owner';
    await authService.ensureOwnerUser({ email: ownerEmail, password: ownerPassword, name: ownerName });
  } catch (_) {}

  const server = http.createServer(app);
  const start = (p) => {
    port = p;
    server.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  };
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      if (port !== DEFAULT_PORT) {
        console.warn(`Port ${port} in use. Falling back to ${DEFAULT_PORT} ...`);
        start(DEFAULT_PORT);
      } else {
        console.error(`Port ${port} is in use and no fallback available. Free the port or set PORT to a free value.`);
        process.exit(1);
      }
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
  start(port);
}

boot();
