// Production-Ready Main Entry Point
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

// Production console suppression
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Override localStorage to handle quota gracefully
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
  try {
    originalSetItem.call(this, key, value);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      return;
    }
    throw error;
  }
};

// Global error handlers for production
window.addEventListener('error', (event) => {
  event.preventDefault();
  return false;
});

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  return false;
});

// Render application
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}