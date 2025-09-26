// Chrome Error Handler - Prevents console spam and handles errors gracefully
class ChromeErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.maxErrorsPerType = 3;
    this.resetInterval = 60000; // Reset error counts every minute
    
    // Reset error counts periodically
    setInterval(() => {
      this.errorCounts.clear();
    }, this.resetInterval);
  }

  // Safe execution wrapper
  safeExecute(fn, fallback = null) {
    try {
      return fn();
    } catch (error) {
      this.logError('SafeExecute', error);
      return fallback;
    }
  }

  // Safe async execution wrapper
  async safeExecuteAsync(fn, fallback = null) {
    try {
      return await fn();
    } catch (error) {
      this.logError('SafeExecuteAsync', error);
      return fallback;
    }
  }

  // Log error with rate limiting
  logError(type, error) {
    const errorKey = `${type}:${error.message}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    
    if (currentCount < this.maxErrorsPerType) {
      console.error(`❌ ${type} Error:`, error.message);
      this.errorCounts.set(errorKey, currentCount + 1);
      
      if (currentCount === this.maxErrorsPerType - 1) {
        console.warn(`⚠️ ${type} error limit reached. Further similar errors will be suppressed.`);
      }
    }
  }

  // Safe fetch wrapper with timeout and error handling
  async safeFetch(url, options = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }

  // Safe localStorage operations
  safeLocalStorageGet(key, defaultValue = null) {
    return this.safeExecute(() => {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    }, defaultValue);
  }

  safeLocalStorageSet(key, value) {
    return this.safeExecute(() => {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }, false);
  }

  // Safe DOM operations
  safeDOMQuery(selector, fallback = null) {
    return this.safeExecute(() => {
      return document.querySelector(selector);
    }, fallback);
  }

  // Network status checker
  isOnline() {
    return navigator.onLine;
  }

  // Token validation
  hasValidToken() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Basic token format check
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  }

  // Clear error counts manually
  clearErrorCounts() {
    this.errorCounts.clear();
  }

  // Get error statistics
  getErrorStats() {
    const stats = {};
    for (const [key, count] of this.errorCounts.entries()) {
      stats[key] = count;
    }
    return stats;
  }
}

// Create singleton instance
const chromeErrorHandler = new ChromeErrorHandler();

// Global error handler to catch unhandled errors
window.addEventListener('error', (event) => {
  chromeErrorHandler.logError('Global', event.error || new Error(event.message));
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  chromeErrorHandler.logError('UnhandledPromise', event.reason || new Error('Unhandled promise rejection'));
  event.preventDefault(); // Prevent console spam
});

export default chromeErrorHandler;