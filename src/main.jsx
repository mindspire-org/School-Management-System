import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './assets/css/App.css';

import App from './App';

const isFileProtocol = typeof window !== 'undefined' && String(window.location?.protocol || '') === 'file:';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isFileProtocol ? (
      <HashRouter>
        <App />
      </HashRouter>
    ) : (
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    )}
  </React.StrictMode>
);
