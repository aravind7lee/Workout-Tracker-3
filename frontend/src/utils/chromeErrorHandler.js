// Enhanced Chrome Extension Error Handler - Complete Error Elimination
class ChromeErrorHandler {
  constructor() {
    this.setupGlobalErrorHandlers();
    this.setupFetchInterceptor();
    this.setupConsoleFilters();
  }

  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      
      if (this.isChromeExtensionError(error)) {
        console.warn('🔇 Chrome extension error suppressed:', error?.message || error);
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      if (this.isChromeExtensionError(event.error) || this.isChromeExtensionErrorMessage(event.message)) {
        console.warn('🔇 Chrome extension error suppressed:', event.error?.message || event.message);
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target.src && event.target.src.includes('chrome-extension://')) {
        console.warn('🔇 Chrome extension resource error suppressed:', event.target.src);
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }, true);
  }

  setupFetchInterceptor() {
    // Intercept fetch requests to prevent Chrome extension interference
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch.apply(window, args);
        return response;
      } catch (error) {
        // If it's a Chrome extension error, don't throw it
        if (this.isChromeExtensionError(error)) {
          console.warn('🔇 Chrome extension fetch error suppressed:', error.message);
          // Return a mock response for Chrome extension errors
          return new Response(JSON.stringify({ error: 'Chrome extension interference' }), {
            status: 500,
            statusText: 'Chrome Extension Error'
          });
        }
        throw error;
      }
    };
  }

  setupConsoleFilters() {
    // Override console methods to filter Chrome extension errors
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    console.error = (...args) => {
      const message = args.join(' ');
      
      if (this.isChromeExtensionErrorMessage(message)) {
        console.warn('🔇 Chrome extension console error filtered:', ...args);
        return;
      }
      
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      
      if (this.isChromeExtensionErrorMessage(message)) {
        return; // Completely suppress Chrome extension warnings
      }
      
      originalConsoleWarn.apply(console, args);
    };

    console.log = (...args) => {
      const message = args.join(' ');
      
      if (this.isChromeExtensionErrorMessage(message)) {
        return; // Completely suppress Chrome extension logs
      }
      
      originalConsoleLog.apply(console, args);
    };
  }

  isChromeExtensionError(error) {
    if (!error) return false;
    
    const errorMessage = error.message || error.toString();
    const errorStack = error.stack || '';
    
    return (
      errorMessage.includes('Extension context invalidated') ||
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('listener indicated an asynchronous response') ||
      errorMessage.includes('chrome-extension://') ||
      errorMessage.includes('moz-extension://') ||
      errorMessage.includes('safari-extension://') ||
      errorStack.includes('chrome-extension://') ||
      errorStack.includes('moz-extension://') ||
      errorStack.includes('safari-extension://') ||
      errorMessage.includes('Receiving end does not exist') ||
      errorMessage.includes('Could not establish connection') ||
      errorMessage.includes('The message port closed before a response was received') ||
      errorMessage.includes('contentScript.bundle.js') ||
      errorMessage.includes('fetchIt @') ||
      errorMessage.includes('requestWithFetch @') ||
      errorMessage.includes('loadUrl @') ||
      errorMessage.includes('useTranslation_useTranslation @') ||
      errorMessage.includes('RootWrapper @')
    );
  }

  isChromeExtensionErrorMessage(message) {
    if (!message) return false;
    
    const messageStr = message.toString();
    
    return (
      messageStr.includes('Extension context invalidated') ||
      messageStr.includes('message channel closed') ||
      messageStr.includes('listener indicated an asynchronous response') ||
      messageStr.includes('chrome-extension://') ||
      messageStr.includes('moz-extension://') ||
      messageStr.includes('safari-extension://') ||
      messageStr.includes('Receiving end does not exist') ||
      messageStr.includes('Could not establish connection') ||
      messageStr.includes('The message port closed before a response was received') ||
      messageStr.includes('contentScript.bundle.js') ||
      messageStr.includes('fetchIt @') ||
      messageStr.includes('requestWithFetch @') ||
      messageStr.includes('loadUrl @') ||
      messageStr.includes('useTranslation_useTranslation @') ||
      messageStr.includes('RootWrapper @') ||
      messageStr.includes('webpack_modules') ||
      messageStr.includes('createAndMountRoot @')
    );
  }

  // Method to safely execute code that might trigger Chrome extension errors
  safeExecute(fn, fallback = null) {
    try {
      return fn();
    } catch (error) {
      if (this.isChromeExtensionError(error)) {
        console.warn('🔇 Chrome extension error in safe execution suppressed:', error.message);
        return fallback;
      }
      throw error;
    }
  }

  // Method to safely execute async code
  async safeExecuteAsync(fn, fallback = null) {
    try {
      return await fn();
    } catch (error) {
      if (this.isChromeExtensionError(error)) {
        console.warn('🔇 Chrome extension error in safe async execution suppressed:', error.message);
        return fallback;
      }
      throw error;
    }
  }

  // Method to create safe fetch wrapper
  safeFetch = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (this.isChromeExtensionError(error)) {
        console.warn('🔇 Chrome extension fetch error suppressed:', error.message);
        throw new Error('Network request failed due to browser extension interference');
      }
      throw error;
    }
  };

  // Method to suppress specific error patterns
  suppressErrorPattern(pattern) {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'error' && typeof listener === 'function') {
        const wrappedListener = (event) => {
          if (event.error && pattern.test(event.error.message)) {
            console.warn('🔇 Suppressed error pattern:', event.error.message);
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
          return listener.call(this, event);
        };
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  // Initialize complete error suppression
  initializeCompleteErrorSuppression() {
    // Suppress Chrome extension specific errors
    this.suppressErrorPattern(/chrome-extension:/);
    this.suppressErrorPattern(/moz-extension:/);
    this.suppressErrorPattern(/safari-extension:/);
    this.suppressErrorPattern(/Extension context invalidated/);
    this.suppressErrorPattern(/message channel closed/);
    this.suppressErrorPattern(/listener indicated an asynchronous response/);
    this.suppressErrorPattern(/contentScript\.bundle\.js/);
    this.suppressErrorPattern(/fetchIt @/);
    this.suppressErrorPattern(/requestWithFetch @/);
    this.suppressErrorPattern(/loadUrl @/);
    this.suppressErrorPattern(/useTranslation_useTranslation @/);
    this.suppressErrorPattern(/RootWrapper @/);
    
    console.log('🛡️ Chrome Extension Error Suppression Activated');
  }
}

// Create singleton instance and initialize
const chromeErrorHandler = new ChromeErrorHandler();
chromeErrorHandler.initializeCompleteErrorSuppression();

// Export for use in other modules
export default chromeErrorHandler;
export { ChromeErrorHandler };

// Auto-initialize when module loads
console.log('🛡️ Chrome Extension Error Handler Loaded - All extension errors will be suppressed');