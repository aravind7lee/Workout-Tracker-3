import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import {
  performStartupCleanup,
  shouldPerformCleanup,
} from "./utils/appStartupCleanup";
import "./index.css";
import "./utils/themeInit"; // Initialize theme before anything else

// Perform one-time cleanup of fake meal data
if (shouldPerformCleanup()) {
  performStartupCleanup();
}

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
}


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
    </React.StrictMode>,
  );
}
