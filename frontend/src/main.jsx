import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";
import "./utils/themeInit"; // Initialize theme before anything else
import "./utils/errorSuppressor"; // Complete error suppression

// Handle storage quota gracefully without interfering with React
if (typeof window !== "undefined") {
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    try {
      originalSetItem.call(this, key, value);
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        console.warn("Storage quota exceeded, skipping save");
        return;
      }
      throw error;
    }
  };

  // Error suppression handled by errorSuppressor.js
}

// Enhanced fetch with rate limiting and error suppression
const originalFetch = window.fetch;
let requestCounts = new Map();
let lastRequestTime = new Map();

window.fetch = async (...args) => {
  const url = args[0];
  const now = Date.now();
  
  // Rate limiting - prevent spam requests
  if (typeof url === 'string' && url.includes('/api/')) {
    const endpoint = url.split('/api/')[1]?.split('?')[0];
    const lastTime = lastRequestTime.get(endpoint) || 0;
    const count = requestCounts.get(endpoint) || 0;
    
    // Block if too many requests in short time
    if (now - lastTime < 5000 && count > 2) {
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Reset counter every 30 seconds
    if (now - lastTime > 30000) {
      requestCounts.set(endpoint, 1);
    } else {
      requestCounts.set(endpoint, count + 1);
    }
    lastRequestTime.set(endpoint, now);
  }
  
  try {
    const response = await originalFetch(...args);
    
    // Silently handle common API errors
    if (!response.ok && typeof url === 'string') {
      if (url.includes('/api/users/streak') || 
          url.includes('/api/health') ||
          url.includes('/api/users/stats') ||
          url.includes('/api/analytics') ||
          url.includes('/api/users/activity') ||
          url.includes('/api/users/achievements')) {
        return new Response(JSON.stringify({ error: "Service unavailable" }), {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    return response;
  } catch (error) {
    // Return mock response for failed requests
    if (typeof url === 'string' && url.includes('/api/')) {
      return new Response(JSON.stringify({ error: "Network error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    throw error;
  }
};

// Clear rate limit counters every 5 minutes
setInterval(() => {
  requestCounts.clear();
  lastRequestTime.clear();
}, 300000);

// Render application
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
