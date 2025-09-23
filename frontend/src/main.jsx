// Production-Ready Main Entry Point
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

// Production console suppression - preserve critical errors
if (process.env.NODE_ENV === 'production') {
  const originalError = console.error;
  console.log = () => {};
  console.warn = () => {};
  console.error = (...args) => {
    // Only log critical authentication and network errors
    const message = args.join(' ');
    if (message.includes('auth') || message.includes('network') || message.includes('Cannot read properties')) {
      originalError.apply(console, args);
    }
  };
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

// Global error handlers for production with selective logging
window.addEventListener('error', (event) => {
  // Log critical errors but prevent user-facing crashes
  if (event.error && (event.error.message.includes('Cannot read properties') || 
                     event.error.message.includes('auth') ||
                     event.error.message.includes('user'))) {
    console.error('Critical error:', event.error.message, event.error.stack);
  }
  event.preventDefault();
  return false;
});

window.addEventListener('unhandledrejection', (event) => {
  // Log critical promise rejections
  if (event.reason && typeof event.reason === 'object' && 
      (event.reason.message?.includes('auth') || event.reason.message?.includes('user'))) {
    console.error('Critical promise rejection:', event.reason);
  }
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