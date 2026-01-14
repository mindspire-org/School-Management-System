// Preload script - isolated world (CommonJS)
// Using CommonJS to avoid ESM issues when package.json has "type":"module"
const { contextBridge, ipcRenderer } = require('electron');

// In packaged app (file://), expose API base URL derived from query param set by main window
try {
  const isPackaged = typeof location !== 'undefined' && String(location.protocol).startsWith('file');
  if (isPackaged) {
    let apiBase = null;
    try {
      const params = new URLSearchParams(String(globalThis.location?.search || ''));
      const backend = params.get('backend');
      if (backend) apiBase = `http://127.0.0.1:${backend}/api`;
    } catch {}
    if (apiBase) {
      try { contextBridge.exposeInMainWorld('ELECTRON_CONFIG', { API_BASE_URL: apiBase }); } catch {}
      try { contextBridge.exposeInMainWorld('__API_BASE_URL', apiBase); } catch {}
    }
  }
} catch {}

contextBridge.exposeInMainWorld('electronAPI', {
  // Folder dialog
  openFolderDialog: () => ipcRenderer.invoke('dialog:open-folder'),
  closeSplash: () => ipcRenderer.invoke('splash:ready'),
  // Printing helpers
  printCurrent: (options) => ipcRenderer.invoke('print:current', options || {}),
  printHTML: (html, options) => ipcRenderer.invoke('print:html', html, options || {}),
  printURL: (url, options) => ipcRenderer.invoke('print:url', url, options || {}),
  printPreviewCurrent: (options) => ipcRenderer.invoke('print:preview-current', options || {}),
  printPreviewHtml: (html, options) => ipcRenderer.invoke('print:preview-html', html, options || {}),
  printPreviewPdf: (dataUrlOrBase64) => ipcRenderer.invoke('print:preview-pdf', dataUrlOrBase64),
  // Backend info
  getBackendBase: () => ipcRenderer.invoke('backend:get-base'),
  backendRestart: () => ipcRenderer.invoke('backend:restart'),
});
