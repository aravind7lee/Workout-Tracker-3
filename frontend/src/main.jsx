// Clean Main Entry Point
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

// Prevent browser extension conflicts
if (typeof window !== 'undefined') {
  // Override problematic console methods that cause extension conflicts
  const noop = () => {};
  if (window.location.hostname !== 'localhost') {
    console.log = noop;
    console.warn = noop;
    console.info = noop;
  }
  
  // Handle storage quota gracefully
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    try {
      originalSetItem.call(this, key, value);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        return;
      }
    }
  };
  
  // Prevent extension message channel errors
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('message channel closed') ||
        event.error?.message?.includes('contentScript') ||
        event.error?.message?.includes('extension')) {
      event.preventDefault();
      return false;
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('message channel closed') ||
        event.reason?.message?.includes('contentScript') ||
        event.reason?.message?.includes('extension')) {
      event.preventDefault();
      return false;
    }
  });
}

// Render application
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}