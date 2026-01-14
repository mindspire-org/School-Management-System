import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import http from 'http';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_BACKEND_PORT = 59201;
let backendProcess = null;

let logStream = null;

let mainWindow = null;
let splashWindow = null;
let splashClosed = false;

function ensureLogStream() {
  if (logStream) return logStream;
  try {
    const dir = path.join(app.getPath('userData'), 'logs');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'main.log');
    logStream = fs.createWriteStream(file, { flags: 'a' });
  } catch (_) {
    logStream = null;
  }
  return logStream;
}

function logLine(...parts) {
  const line = `[${new Date().toISOString()}] ${parts.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join(' ')}\n`;
  try { process.stdout.write(line); } catch (_) {}
  const s = ensureLogStream();
  if (s) {
    try { s.write(line); } catch (_) {}
  }
}

process.on('uncaughtException', (err) => {
  logLine('uncaughtException', err?.stack || String(err));
});

process.on('unhandledRejection', (err) => {
  logLine('unhandledRejection', err?.stack || String(err));
});

function startBackend() {
  const isDev = !app.isPackaged;
  const backendPort = process.env.BACKEND_PORT || DEFAULT_BACKEND_PORT;
  const backendDir = isDev
    ? path.join(__dirname, '../backend')
    : path.join(process.resourcesPath, 'backend');
  const serverPath = path.join(backendDir, 'src', 'server.js');

  const backendEnvPath = path.join(app.getPath('userData'), 'backend.env');

  if (!fs.existsSync(serverPath)) {
    logLine('Backend server.js not found at:', serverPath);
    return null;
  }

  const child = spawn(process.execPath, [serverPath], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: String(backendPort),
      NODE_ENV: isDev ? 'development' : 'production',
      ELECTRON_RUN_AS_NODE: '1',
      SMS_ENV_PATH: backendEnvPath,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  try {
    child.stdout?.on('data', (d) => logLine('backend:stdout', String(d).trimEnd()));
    child.stderr?.on('data', (d) => logLine('backend:stderr', String(d).trimEnd()));
    child.on('exit', (code, signal) => logLine('backend:exit', { code, signal }));
    child.on('error', (e) => logLine('backend:error', e?.stack || String(e)));
  } catch (_) {}

  return child;
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode || 0);
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      try { req.destroy(new Error('timeout')); } catch (_) {}
    });
  });
}

async function waitForBackend(port, { timeoutMs = 20000 } = {}) {
  const start = Date.now();
  const url = `http://127.0.0.1:${port}/health`;
  while (Date.now() - start < timeoutMs) {
    try {
      const code = await httpGet(url);
      if (code >= 200 && code < 300) return true;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

function getBackendBase(port) {
  return `http://127.0.0.1:${port}/api`;
}

function createSplashWindow() {
  splashClosed = false;
  splashWindow = new BrowserWindow({
    width: 520,
    height: 420,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    show: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  splashWindow.on('closed', () => {
    splashWindow = null;
    splashClosed = true;
    if (mainWindow && !mainWindow.isDestroyed()) {
      try { mainWindow.show(); } catch (_) {}
    }
  });

  const splashPath = path.join(__dirname, 'splash.html');
  splashWindow.loadFile(splashPath);
}

async function createWindow() {
  const isDev = !app.isPackaged;
  const backendPort = process.env.BACKEND_PORT || DEFAULT_BACKEND_PORT;
  process.env.BACKEND_PORT = String(backendPort);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    if (splashClosed || isDev) {
      try { mainWindow.show(); } catch (_) {}
    }

    if (!isDev && splashWindow && !splashWindow.isDestroyed()) {
      try { splashWindow.close(); } catch (_) {}
    }
  });

  mainWindow.webContents.on('did-fail-load', (_evt, errorCode, errorDescription, validatedURL) => {
    logLine('did-fail-load', { errorCode, errorDescription, validatedURL });
  });

  mainWindow.webContents.on('render-process-gone', (_evt, details) => {
    logLine('render-process-gone', details);
  });

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:8080';
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const candidates = [
      path.join(app.getAppPath(), 'dist', 'index.html'),
      path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html'),
      path.join(process.resourcesPath, 'app', 'dist', 'index.html'),
    ];
    const indexPath = candidates.find((p) => {
      try { return fs.existsSync(p); } catch (_) { return false; }
    });

    if (!indexPath) {
      logLine('dist/index.html not found. candidates:', candidates);
    } else {
      logLine('Loading renderer index:', indexPath);
    }

    try {
      await mainWindow.loadFile(indexPath || candidates[0], { search: `?backend=${backendPort}` });
    } catch (e) {
      logLine('loadFile failed', e?.stack || String(e));
      try {
        await dialog.showMessageBox({
          type: 'error',
          title: 'App Failed to Start',
          message: 'Frontend failed to load. Please check logs in the app data folder.',
        });
      } catch (_) {}
    }
  }

  // open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function setupIpc() {
  ipcMain.handle('splash:ready', async () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      try { splashWindow.close(); } catch (_) {}
    }
    splashClosed = true;
    if (mainWindow && !mainWindow.isDestroyed()) {
      try { mainWindow.show(); } catch (_) {}
    }
    return true;
  });

  ipcMain.handle('dialog:open-folder', async () => {
    const res = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (res.canceled) return null;
    return res.filePaths?.[0] || null;
  });

  ipcMain.handle('backend:get-base', async () => {
    const port = Number(process.env.BACKEND_PORT) || DEFAULT_BACKEND_PORT;
    return getBackendBase(port);
  });

  ipcMain.handle('backend:restart', async () => {
    const isDev = !app.isPackaged;
    const port = Number(process.env.BACKEND_PORT) || DEFAULT_BACKEND_PORT;
    if (isDev) return getBackendBase(port);
    shutdownBackend();
    backendProcess = startBackend();
    await waitForBackend(port, { timeoutMs: 20000 });
    return getBackendBase(port);
  });

  ipcMain.handle('print:current', async (_evt, options = {}) => {
    const win = BrowserWindow.getFocusedWindow() || mainWindow;
    if (!win || win.isDestroyed()) return false;
    return new Promise((resolve) => {
      try { win.webContents.print(options, () => resolve(true)); } catch (_) { resolve(false); }
    });
  });

  ipcMain.handle('print:html', async (_evt, html, options = {}) => {
    const printWin = new BrowserWindow({
      show: false,
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: false },
    });
    try {
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(String(html || ''))}`;
      await printWin.loadURL(dataUrl);
      await new Promise((resolve) => {
        try { printWin.webContents.print(options, () => resolve()); } catch (_) { resolve(); }
      });
      return true;
    } finally {
      try { printWin.close(); } catch (_) {}
    }
  });

  ipcMain.handle('print:url', async (_evt, url, options = {}) => {
    const printWin = new BrowserWindow({
      show: false,
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: false },
    });
    try {
      await printWin.loadURL(String(url));
      await new Promise((resolve) => {
        try { printWin.webContents.print(options, () => resolve()); } catch (_) { resolve(); }
      });
      return true;
    } finally {
      try { printWin.close(); } catch (_) {}
    }
  });

  ipcMain.handle('print:preview-current', async () => {
    const win = BrowserWindow.getFocusedWindow() || mainWindow;
    if (!win || win.isDestroyed()) return null;
    try {
      const pdf = await win.webContents.printToPDF({});
      const tmp = path.join(os.tmpdir(), `sms-preview-${Date.now()}.pdf`);
      fs.writeFileSync(tmp, pdf);
      await shell.openPath(tmp);
      return tmp;
    } catch (_) {
      return null;
    }
  });

  ipcMain.handle('print:preview-html', async (_evt, html) => {
    const previewWin = new BrowserWindow({
      show: false,
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: false },
    });
    try {
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(String(html || ''))}`;
      await previewWin.loadURL(dataUrl);
      const pdf = await previewWin.webContents.printToPDF({});
      const tmp = path.join(os.tmpdir(), `sms-preview-${Date.now()}.pdf`);
      fs.writeFileSync(tmp, pdf);
      await shell.openPath(tmp);
      return tmp;
    } catch (_) {
      return null;
    } finally {
      try { previewWin.close(); } catch (_) {}
    }
  });

  ipcMain.handle('print:preview-pdf', async (_evt, dataUrlOrBase64) => {
    try {
      const raw = String(dataUrlOrBase64 || '');
      const base64 = raw.startsWith('data:') ? (raw.split(',')[1] || '') : raw;
      const buf = Buffer.from(base64, 'base64');
      const tmp = path.join(os.tmpdir(), `sms-preview-${Date.now()}.pdf`);
      fs.writeFileSync(tmp, buf);
      await shell.openPath(tmp);
      return tmp;
    } catch (_) {
      return null;
    }
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      } catch (_) {}
    }
  });

  app.whenReady().then(async () => {
    if (process.platform === 'win32') {
      try { app.setAppUserModelId('org.mindspire.school'); } catch (_) {}
    }

    setupIpc();

    const isDev = !app.isPackaged;
    if (!isDev) {
      createSplashWindow();
      const backendPort = Number(process.env.BACKEND_PORT) || DEFAULT_BACKEND_PORT;
      process.env.BACKEND_PORT = String(backendPort);
      backendProcess = startBackend();
      if (!backendProcess) {
        const logPath = path.join(app.getPath('userData'), 'logs', 'main.log');
        const envPath = path.join(app.getPath('userData'), 'backend.env');
        try {
          await dialog.showMessageBox({
            type: 'error',
            title: 'Backend Failed to Start',
            message: 'Backend process could not start. Please check the log file and configure database settings.',
            detail: `Log: ${logPath}\nConfig: ${envPath}`,
          });
        } catch (_) {}
      }
      const ok = await waitForBackend(backendPort, { timeoutMs: 25000 });
      if (!ok) {
        logLine('Backend did not become healthy within timeout.', { backendPort });
        const logPath = path.join(app.getPath('userData'), 'logs', 'main.log');
        const envPath = path.join(app.getPath('userData'), 'backend.env');
        try {
          await dialog.showMessageBox({
            type: 'error',
            title: 'Backend Not Responding',
            message: 'Backend did not become healthy. This usually means the database is not reachable on this PC.',
            detail: `Ensure Postgres is running and DATABASE_URL is correct.\n\nLog: ${logPath}\nConfig: ${envPath}`,
          });
        } catch (_) {}
      }
    }

    await createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

function shutdownBackend() {
  if (backendProcess) {
    try { backendProcess.kill(); } catch (_) {}
    backendProcess = null;
  }
}

app.on('before-quit', shutdownBackend);
app.on('will-quit', shutdownBackend);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
