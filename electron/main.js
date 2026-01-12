// Electron Main Process
import { app, BrowserWindow, ipcMain, nativeTheme, shell, dialog, session } from 'electron';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let splashWindow;
let splashShownAt = 0;
let splashReady = false;
let mainReady = false;
const MIN_SPLASH_MS = 2000;
let backendProcess = null;
let backendPort = 4000;
let backendReady = false;

function resolveIconPath() {
  const names = ['school_icon.ico', 'school_icon.png', 'favicon.ico', 'logofavicon.png', 'school.png'];
  const locations = [
    // Dev/public (root)
    path.join(__dirname, '..', 'public'),
    // Frontend public
    path.join(__dirname, '..', 'frontend', 'public'),
    // Packaged extraResources (unpacked)
    path.join(process.resourcesPath || '', 'app.asar.unpacked', 'public'),
    // Packaged extraResources direct
    path.join(process.resourcesPath || '', 'public'),
    // As a fallback, check dist as well
    path.join(__dirname, '..', 'dist'),
  ];
  for (const dir of locations) {
    for (const n of names) {
      const p = path.join(dir, n);
      try { if (fs.existsSync(p)) return p; } catch {}

async function embedBackendInProcess(entry, cwd, env) {
  try {
    // Temporarily switch CWD and env to run backend inline
    const prevCwd = process.cwd();
    const prevEnv = { ...process.env };
    try {
      process.chdir(cwd);
    } catch {}
    try {
      for (const k of Object.keys(env || {})) {
        process.env[k] = String(env[k]);
      }
      // In production, help backend resolve modules from app.asar/node_modules
      const nodePaths = [];
      // Prefer backend's own packaged node_modules first
      try { nodePaths.push(path.join(process.resourcesPath, 'backend', 'node_modules')); } catch {}
      try { nodePaths.push(path.join(process.resourcesPath, 'app.asar', 'node_modules')); } catch {}
      try { nodePaths.push(path.join(process.resourcesPath, 'app', 'node_modules')); } catch {}
      try { nodePaths.push(path.join(__dirname, '..', 'node_modules')); } catch {}
      const existing = process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [];
      const merged = [...existing, ...nodePaths].filter(Boolean);
      process.env.NODE_PATH = Array.from(new Set(merged)).join(path.delimiter);
      try {
        const Module = createRequire(import.meta.url)('module');
        if (Module && typeof Module._initPaths === 'function') Module._initPaths();
      } catch {}
    } catch {}
    try {
      const req = createRequire(import.meta.url);
      req(entry);
    } catch (e) {
      console.error('[backend][embed] require failed:', e);
    }
    // Restore CWD and env (backend keeps its own copies)
    try { process.chdir(prevCwd); } catch {}
    for (const k of Object.keys(prevEnv)) { process.env[k] = prevEnv[k]; }
  } catch (e) {
    console.error('[backend][embed] error:', e);
  }
  // Wait for health briefly
  backendReady = await waitForBackend(backendPort, 10000);
  return backendReady;
}
    }
  }
  // Fallback to dev path even if missing; Electron will ignore if not found
  return path.join(__dirname, '..', 'public', 'school_icon.png');
}

// Ensure single instance of the app
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // Another instance is already running; quit this one immediately
  app.quit();
} else {
  // Focus existing window on second instance
  app.on('second-instance', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      try { splashWindow.show(); splashWindow.focus(); } catch {}
      return;
    }
    if (mainWindow) {
      try {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      } catch {}
    }
  });

// IPC: Backend info and control
ipcMain.handle('backend:get-base', async () => {
  try {
    return { ok: true, base: `http://127.0.0.1:${backendPort || 4000}`, ready: !!backendReady };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
});

ipcMain.handle('backend:restart', async () => {
  try {
    await startBackend();
    return { ok: true, base: `http://127.0.0.1:${backendPort || 4000}`, ready: !!backendReady };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
});

// Preview helper: accept a PDF data URL or base64 string and show it in preview window
ipcMain.handle('print:preview-pdf', async (_event, dataUrlOrBase64) => {
  try {
    let base64 = ''
    if (typeof dataUrlOrBase64 === 'string'){
      const s = dataUrlOrBase64.trim()
      if (s.startsWith('data:')){
        const idx = s.indexOf('base64,')
        base64 = idx !== -1 ? s.substring(idx + 'base64,'.length) : ''
      } else {
        base64 = s
      }
    }
    if (!base64) return { ok: false, error: 'Invalid PDF data' }
    const buf = Buffer.from(base64, 'base64')
    const tmp = path.join(app.getPath('temp'), `preview-${Date.now()}.pdf`)
    fs.writeFileSync(tmp, buf)
    const win = new BrowserWindow({ width: 1000, height: 800, show: true, webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } })
    await win.loadURL(pathToFileURL(tmp).toString())
    win.on('closed', () => { try { fs.unlinkSync(tmp) } catch {} })
    return { ok: true, path: tmp }
  } catch (e) {
    return { ok: false, error: e?.message || String(e) }
  }
})
}

const isDev = !app.isPackaged || !!process.env.VITE_DEV_SERVER_URL;

function resolveBackendEntry() {
  // In dev, run from project backend folder
  if (isDev) {
    return path.join(__dirname, '..', 'backend', 'index.js');
  }
  // In production, try realistic locations depending on electron-builder packing
  const candidates = [
    // Preferred: extraResources -> backend/dist/backend.js (unpacked)
    path.join(process.resourcesPath, 'backend', 'dist', 'backend.js'),
    // extraResources -> backend/index.js (unpacked)
    path.join(process.resourcesPath, 'backend', 'index.js'),
    path.join(process.resourcesPath, 'app.asar.unpacked', 'backend', 'dist', 'backend.js'),
    // If resources packed under app
    path.join(process.resourcesPath, 'app', 'backend', 'dist', 'backend.js'),
    // Legacy index.js fallback
    path.join(process.resourcesPath, 'app.asar.unpacked', 'backend', 'index.js'),
    path.join(process.resourcesPath, 'app', 'backend', 'index.js'),
    // Dev-like fallback
    path.join(__dirname, '..', 'backend', 'dist', 'backend.js'),
    path.join(__dirname, '..', 'backend', 'index.js'),
  ];
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c; } catch {}
  }
  // Return the first as a best-effort fallback
  return candidates[0];
}

async function findFreePort(preferred = 4000) {
  // If preferred is > 0, test that exact port first
  if (Number(preferred) > 0) {
    const canListen = (port) => new Promise((resolve) => {
      const srv = net.createServer();
      srv.once('error', () => resolve(false));
      srv.once('listening', () => { srv.close(() => resolve(true)); });
      srv.listen(port, '127.0.0.1');
    });
    if (await canListen(preferred)) return preferred;
  }
  // Otherwise, or if preferred is busy, let the OS assign a free port (port 0)
  return await new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      srv.close(() => resolve(port));
    });
  });
}

async function startBackend() {
  const entry = resolveBackendEntry();
  const env = { ...process.env };

  // Try up to 3 attempts; on retries, choose a new free port
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Choose a port (prefer 4000 first, then random free)
    try {
      const preferred = attempt === 1 ? (Number(env.PORT) || 4000) : 0;
      backendPort = await findFreePort(preferred);
    } catch {
      backendPort = 4000;
    }
    env.PORT = String(backendPort);
    // Ensure DB URI is set to loopback
    env.MONGO_URI = env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_mgmt';
    // Help child process resolve modules in production
    try {
      const nodePaths = [];
      nodePaths.push(path.join(process.resourcesPath, 'backend', 'node_modules'));
      nodePaths.push(path.join(process.resourcesPath, 'app.asar', 'node_modules'));
      nodePaths.push(path.join(process.resourcesPath, 'app', 'node_modules'));
      nodePaths.push(path.join(__dirname, '..', 'node_modules'));
      const existing = env.NODE_PATH ? env.NODE_PATH.split(path.delimiter) : [];
      const merged = [...existing, ...nodePaths].filter(Boolean);
      env.NODE_PATH = Array.from(new Set(merged)).join(path.delimiter);
    } catch {}

    // Set working directory so dotenv and relative paths work
    const cwd = (function(){
      if (isDev) return path.join(__dirname, '..', 'backend');
      // Prefer resources/backend (extraResources)
      const resBackend = path.join(process.resourcesPath, 'backend');
      if (fs.existsSync(resBackend)) return resBackend;
      const unpacked = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend');
      if (fs.existsSync(unpacked)) return unpacked;
      const appBackend = path.join(process.resourcesPath, 'app', 'backend');
      return appBackend;
    })();

    // In production, use Electron binary in Node mode to run the backend script
    // This avoids launching another Electron app instance.
    const nodeExec = process.execPath;
    if (!isDev) env.ELECTRON_RUN_AS_NODE = '1';

    try { if (backendProcess && !backendProcess.killed) backendProcess.kill(process.platform === 'win32' ? 'SIGTERM' : 'SIGINT'); } catch {}

    backendProcess = spawn(nodeExec, [entry], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      cwd,
    });

    // Write backend logs to file for diagnostics in production
    try {
      const logsDir = path.join(app.getPath('userData'), 'logs');
      try { fs.mkdirSync(logsDir, { recursive: true }); } catch {}
      const logFile = path.join(logsDir, 'backend.log');
      const append = (tag, chunk) => {
        try {
          const line = `[${new Date().toISOString()}][${tag}] ${chunk.toString()}`;
          fs.appendFileSync(logFile, line);
        } catch {}
      };
      backendProcess.stdout?.on('data', (d) => append('OUT', d));
      backendProcess.stderr?.on('data', (d) => append('ERR', d));
    } catch {}

    backendProcess.on('error', (err) => {
      console.error('[backend] failed to start:', err);
    });
    backendProcess.on('exit', (code, signal) => {
      console.log('[backend] exited', { code, signal });
    });
    // Wait longer for backend to respond on /health
    backendReady = await waitForBackend(backendPort, 30000);
    if (backendReady) return backendPort;
  }
  // Final fallback: try embedding backend in the Electron main process
  try {
    const cwd = (function(){
      if (isDev) return path.join(__dirname, '..', 'backend');
      const resBackend = path.join(process.resourcesPath, 'backend');
      if (fs.existsSync(resBackend)) return resBackend;
      const unpacked = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend');
      if (fs.existsSync(unpacked)) return unpacked;
      const appBackend = path.join(process.resourcesPath, 'app', 'backend');
      return appBackend;
    })();
    await embedBackendInProcess(entry, cwd, env);
  } catch {}
  return backendPort;
}

function waitForBackend(port, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const attempt = () => {
      const req = http.get({ host: '127.0.0.1', port, path: '/health', timeout: 1500 }, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          res.resume();
          return resolve(true);
        }
        res.resume();
        retry();
      });
      req.on('error', retry);
      req.on('timeout', () => { try { req.destroy(); } catch {} retry(); });
      function retry() {
        if (Date.now() - start > timeoutMs) return resolve(false);
        setTimeout(attempt, 500);
      }
    };
    attempt();
  });
}

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 520,
    height: 360,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    show: false,
    icon: resolveIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  splashWindow.once('ready-to-show', () => { splashShownAt = Date.now(); splashWindow.show(); });
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0b1117' : '#ffffff',
    icon: resolveIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // Enable native window.open so print previews and popups can open safely
      nativeWindowOpen: true,
    },
  });

  const tryShow = () => {
    const elapsed = Math.max(0, Date.now() - (splashShownAt || Date.now()));
    if (!splashReady || !mainReady || elapsed < MIN_SPLASH_MS) return;
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    try {
      mainWindow.show();
      mainWindow.focus();
      if (process.platform === 'win32') {
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
        setTimeout(() => { try { mainWindow.setAlwaysOnTop(false); } catch {} }, 100);
      }
      mainWindow.setSkipTaskbar(false);
    } catch {}
  };

  // When the app UI fully loads, mark ready and attempt to show
  mainWindow.webContents.once('did-finish-load', () => { mainReady = true; tryShow(); });
  // Also handle earlier readiness for some packaging scenarios
  mainWindow.once('ready-to-show', () => { mainReady = true; tryShow(); });

  if (isDev) {
    const devURL = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:8080';
    mainWindow.loadURL(devURL);
    // Only open DevTools if explicitly requested
    if (process.env.ELECTRON_DEVTOOLS === '1') {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    try {
      if (!fs.existsSync(indexPath)) {
        dialog.showErrorBox(
          'Application files missing',
          'The application UI files were not found (dist/index.html is missing).\n\nPlease rebuild the app using "npm run build" then create the installer with "npm run dist:win".'
        );
        // Close splash if visible and quit to avoid blank window hanging
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
        app.quit();
        return;
      }
    } catch {}
    // Pass backend port to renderer via URL search params for early, synchronous availability
    try {
      mainWindow.loadFile(indexPath, { search: `?backend=${backendPort || 4000}` });
    } catch {
      mainWindow.loadFile(indexPath);
    }
  }

  // Allow app popups (about:blank or same-origin) for print previews; external links go to default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const devURL = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:8080';
    const isAppUrl = !url || url === 'about:blank' || url.startsWith('file://') || url.startsWith(devURL);
    if (isAppUrl) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            // Harden child windows
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
          },
        },
      };
    }
    try { if (/^https?:\/\//i.test(url)) shell.openExternal(url); } catch {}
    return { action: 'deny' };
  });

  // Optional hardening: prevent navigation away from app's index except dev URL
  mainWindow.webContents.on('will-navigate', (e, url) => {
    const devURL = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:8080';
    const isAppFile = url.startsWith('file://') || url.startsWith(devURL);
    if (!isAppFile) {
      e.preventDefault();
      try { if (/^https?:\/\//i.test(url)) shell.openExternal(url); } catch {}
    }
  });

  // Keyboard: Ctrl+P opens the system print dialog for the current page
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && !input.alt && !input.shift && input.type === 'keyDown' && input.key?.toLowerCase() === 'p') {
      event.preventDefault();
      try {
        mainWindow.webContents.print({ printBackground: true, silent: false });
      } catch (e) {
        console.warn('Print failed from shortcut:', e);
      }
    }
  });

  // Note: do not override window.open so the app can open print previews/popups as intended
}

// IPC: Printing helpers
ipcMain.handle('print:current', async (event, options = {}) => {
  const wc = event?.sender;
  if (!wc) return { ok: false, error: 'No sender' };
  return new Promise((resolve) => {
    try {
      wc.print({ printBackground: true, silent: false, ...options }, (success, failureReason) => {
        if (success) resolve({ ok: true });
        else resolve({ ok: false, error: failureReason || 'Unknown print error' });
      });
    } catch (e) {
      resolve({ ok: false, error: e?.message || String(e) });
    }
  });
});

ipcMain.handle('print:html', async (_event, html, options = {}) => {
  if (typeof html !== 'string' || !html.trim()) return { ok: false, error: 'Invalid HTML' };
  const win = new BrowserWindow({
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  try {
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    return await new Promise((resolve) => {
      win.webContents.print({ printBackground: true, silent: false, ...options }, (success, failureReason) => {
        try { win.close(); } catch {}
        if (success) resolve({ ok: true });
        else resolve({ ok: false, error: failureReason || 'Unknown print error' });
      });
    });
  } catch (e) {
    try { win.close(); } catch {}
    return { ok: false, error: e?.message || String(e) };
  }
});

// Preview helper: render provided HTML to PDF and show it in a preview window
ipcMain.handle('print:preview-html', async (_event, html, options = {}) => {
  if (typeof html !== 'string' || !html.trim()) return { ok: false, error: 'Invalid HTML' };
  const tmpDir = app.getPath('temp');
  const pdfPath = path.join(tmpDir, `preview-${Date.now()}.pdf`);
  const win = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } });
  try {
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    const data = await win.webContents.printToPDF({ printBackground: true, marginsType: 0, ...options });
    fs.writeFileSync(pdfPath, data);
    try { win.close(); } catch {}
    const pv = new BrowserWindow({ width: 1000, height: 800, show: true, webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } });
    await pv.loadURL(pathToFileURL(pdfPath).toString());
    pv.on('closed', () => { try { fs.unlinkSync(pdfPath) } catch {} });
    return { ok: true, path: pdfPath };
  } catch (e) {
    try { win.close() } catch {}
    return { ok: false, error: e?.message || String(e) };
  }
});

// Preview helper: render current page to PDF and show it in a preview window
ipcMain.handle('print:preview-current', async (event, options = {}) => {
  const sender = event?.sender;
  if (!sender) return { ok: false, error: 'No sender' };
  try {
    const pdfData = await sender.printToPDF({ printBackground: true, marginsType: 0, ...options });
    const tmpDir = app.getPath('temp');
    const file = path.join(tmpDir, `preview-${Date.now()}.pdf`);
    fs.writeFileSync(file, pdfData);
    const win = new BrowserWindow({
      width: 1000,
      height: 800,
      show: true,
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    await win.loadURL(pathToFileURL(file).toString());
    // Clean up temp file when window closes
    win.on('closed', () => { try { fs.unlinkSync(file); } catch {} });
    return { ok: true, path: file };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
});

ipcMain.handle('print:url', async (_event, url, options = {}) => {
  if (typeof url !== 'string' || !url.trim()) return { ok: false, error: 'Invalid URL' };
  const win = new BrowserWindow({
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  try {
    await win.loadURL(url);
    return await new Promise((resolve) => {
      win.webContents.print({ printBackground: true, silent: false, ...options }, (success, failureReason) => {
        try { win.close(); } catch {}
        if (success) resolve({ ok: true });
        else resolve({ ok: false, error: failureReason || 'Unknown print error' });
      });
    });
  } catch (e) {
    try { win.close(); } catch {}
    return { ok: false, error: e?.message || String(e) };
  }
});

app.whenReady().then(async () => {
  // Redirect API requests in production to the local backend
  try {
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      try {
        const url = details.url || '';

        if (!isDev) {
          // file://.../api/* -> http://127.0.0.1:PORT/api/*
          if (url.startsWith('file://')) {
            const idx = url.indexOf('/api/');
            if (idx !== -1) {
              const rest = url.substring(idx + '/api'.length); // includes '/...'
              // Special-case health: map /api/health -> /health
              if (rest.startsWith('/health')) {
                const redirectURL = `http://127.0.0.1:${backendPort || 4000}/health${rest.substring('/health'.length)}`;
                return callback({ redirectURL });
              }
              const redirectURL = `http://127.0.0.1:${backendPort || 4000}/api${rest}`;
              return callback({ redirectURL });
            }
          }

          // General rule: any http://localhost:<any>/api/* or http://127.0.0.1:<any>/api/* -> backendPort
          try {
            const u = new URL(url);
            const isLocalHost = (u.hostname === 'localhost' || u.hostname === '127.0.0.1');
            if (isLocalHost && u.pathname.startsWith('/api/')) {
              const currentPort = u.port || (u.protocol === 'http:' ? '80' : u.protocol === 'https:' ? '443' : '');
              const targetPort = String(backendPort || 4000);
              // Special-case health path to /health
              if (u.pathname === '/api/health' || u.pathname.startsWith('/api/health')) {
                const redirectURL = `http://127.0.0.1:${targetPort}/health${u.pathname.substring('/api/health'.length)}${u.search}`;
                return callback({ redirectURL });
              }
              // Otherwise, normalize to backendPort for all other /api/*
              if (currentPort !== targetPort) {
                const redirectURL = `http://127.0.0.1:${targetPort}${u.pathname}${u.search}`;
                return callback({ redirectURL });
              }
            }
          } catch {}
        }
      } catch {}
      callback({});
    });
  } catch {}

  // Start backend by default, but allow disabling via ELECTRON_NO_BACKEND=1.
  // Splash/UI are fully decoupled and will not wait for the backend.
  if (process.env.ELECTRON_NO_BACKEND !== '1') await startBackend();

  // Always show splash (dev and prod). In prod, briefly wait for backend.
  createSplash();
  createMainWindow();

  // Force-close splash and show main after MIN_SPLASH_MS even if UI load events
  // are delayed. This fully decouples splash behavior from app/backend readiness.
  setTimeout(() => {
    try { splashReady = true; } catch {}
    try { mainReady = true; } catch {}
    try {
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        if (process.platform === 'win32') {
          mainWindow.setAlwaysOnTop(true, 'screen-saver');
          setTimeout(() => { try { mainWindow.setAlwaysOnTop(false); } catch {} }, 100);
        }
        mainWindow.setSkipTaskbar(false);
      }
    } catch {}
  }, MIN_SPLASH_MS + 200);

  // Inject backend base URL into renderer so it can use the exact port.
  try {
    mainWindow.webContents.on('dom-ready', () => {
      try {
        const base = `http://127.0.0.1:${backendPort || 4000}`;
        mainWindow.webContents.executeJavaScript(`window.__BACKEND_BASE__ = '${base}';`);
      } catch {}
    });
  } catch {}

  // Splash will be closed when main window is ready-to-show (after a minimum splash duration).

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createSplash();
      createMainWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  try {
    if (backendProcess && !backendProcess.killed) {
      backendProcess.kill(process.platform === 'win32' ? 'SIGTERM' : 'SIGINT');
    }
  } catch (e) {
    // ignore
  }
});

// Optional: allow splash to request closing itself earlier
ipcMain.handle('splash:ready', () => {
  splashReady = true;
  try {
    // In case main window is already loaded, attempt to show now
    if (mainWindow && mainWindow.webContents && mainWindow.webContents.isLoading() === false) {
      mainReady = true;
    }
  } catch {}
  // Defer actual close/show to the readiness check in createMainWindow
  try {
    const elapsed = Math.max(0, Date.now() - (splashShownAt || Date.now()));
    if (elapsed >= MIN_SPLASH_MS && mainReady) {
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      try {
        mainWindow.show();
        mainWindow.focus();
        if (process.platform === 'win32') {
          mainWindow.setAlwaysOnTop(true, 'screen-saver');
          setTimeout(() => { try { mainWindow.setAlwaysOnTop(false); } catch {} }, 100);
        }
        mainWindow.setSkipTaskbar(false);
      } catch {}
    }
  } catch {}
});
