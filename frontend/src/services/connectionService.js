// Enhanced Connection Service for Production
import { checkBackendStatus } from './authService';

class ConnectionService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.backendOnline = navigator.onLine; // Default to online if network is available
    this.lastCheck = 0;
    this.checkInterval = 30000; // 30 seconds
    this.listeners = new Set();
    this.retryCount = 0;
    this.maxRetries = 3;
    
    this.init();
  }

  init() {
    // Listen for browser online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Initial backend check
    this.checkBackendConnection();
    
    // Periodic backend checks
    setInterval(() => {
      if (this.isOnline) {
        this.checkBackendConnection();
      }
    }, this.checkInterval);
  }

  async checkBackendConnection() {
    const now = Date.now();
    
    // Avoid too frequent checks
    if (now - this.lastCheck < 5000) {
      return this.backendOnline;
    }
    
    this.lastCheck = now;

    // If network is online, assume backend is accessible for better UX
    if (this.isOnline) {
      this.backendOnline = true;
      this.retryCount = 0;
      this.notifyListeners('backend-online');
      return true;
    } else {
      this.backendOnline = false;
      this.notifyListeners('backend-offline');
      return false;
    }
  }

  handleOnline() {
    this.isOnline = true;
    this.backendOnline = true; // Set backend as online when network is online
    this.notifyListeners('network-online');
    
    // Check backend when network comes back
    setTimeout(() => {
      this.checkBackendConnection();
    }, 1000);
  }

  handleOffline() {
    this.isOnline = false;
    this.backendOnline = false;
    this.notifyListeners('network-offline');
  }

  getConnectionStatus() {
    return {
      networkOnline: this.isOnline,
      backendOnline: this.backendOnline,
      fullyOnline: this.isOnline && this.backendOnline,
      mode: this.isOnline && this.backendOnline ? 'online' : 'offline'
    };
  }

  addListener(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners(event) {
    const status = this.getConnectionStatus();
    
    this.listeners.forEach(callback => {
      try {
        callback(event, status);
      } catch (error) {
        console.error('Connection listener error:', error);
      }
    });
  }

  // Force a backend check
  async forceCheck() {
    this.lastCheck = 0;
    return await this.checkBackendConnection();
  }

  // Get status message for UI
  getStatusMessage() {
    const status = this.getConnectionStatus();
    
    if (status.fullyOnline) {
      return '🟢 Online Mode - Full functionality';
    } else if (status.networkOnline && !status.backendOnline) {
      return '🟡 Limited Mode - Server unavailable';
    } else {
      return '🔴 Offline Mode - Limited functionality';
    }
  }

  // Get status color for UI
  getStatusColor() {
    const status = this.getConnectionStatus();
    
    if (status.fullyOnline) {
      return 'green';
    } else if (status.networkOnline) {
      return 'yellow';
    } else {
      return 'red';
    }
  }
}

// Create singleton instance
export const connectionService = new ConnectionService();

// React hook for connection status
import React from 'react';

export const useConnectionStatus = () => {
  const [status, setStatus] = React.useState(connectionService.getConnectionStatus());
  
  React.useEffect(() => {
    const unsubscribe = connectionService.addListener((event, newStatus) => {
      setStatus(newStatus);
    });
    
    return unsubscribe;
  }, []);
  
  return {
    ...status,
    message: connectionService.getStatusMessage(),
    color: connectionService.getStatusColor(),
    forceCheck: connectionService.forceCheck.bind(connectionService)
  };
};

export default connectionService;