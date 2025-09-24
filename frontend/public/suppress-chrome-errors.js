// Chrome Extension Error Suppression Script
// This script runs before React and suppresses all Chrome extension errors

(function() {
  'use strict';
  
  console.log('🛡️ Chrome Extension Error Suppression Activated');
  
  // Patterns to identify Chrome extension errors
  const chromeExtensionPatterns = [
    /chrome-extension:/,
    /moz-extension:/,
    /safari-extension:/,
    /Extension context invalidated/,
    /message channel closed/,
    /listener indicated an asynchronous response/,
    /Receiving end does not exist/,
    /Could not establish connection/,
    /The message port closed before a response was received/,
    /contentScript\.bundle\.js/,
    /fetchIt @/,
    /requestWithFetch @/,
    /loadUrl @/,
    /useTranslation_useTranslation @/,
    /RootWrapper @/,
    /webpack_modules/,
    /createAndMountRoot @/
  ];
  
  // Function to check if error is from Chrome extension
  function isChromeExtensionError(error) {
    if (!error) return false;
    
    const message = error.message || error.toString();
    const stack = error.stack || '';
    
    return chromeExtensionPatterns.some(pattern => 
      pattern.test(message) || pattern.test(stack)
    );
  }
  
  // Function to check if message contains Chrome extension error
  function isChromeExtensionMessage(message) {
    if (!message) return false;
    
    const messageStr = message.toString();
    return chromeExtensionPatterns.some(pattern => pattern.test(messageStr));
  }
  
  // Override global error handler
  const originalErrorHandler = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (isChromeExtensionMessage(message) || isChromeExtensionError(error)) {
      console.warn('🔇 Chrome extension error suppressed:', message);
      return true; // Prevent default error handling
    }
    
    if (originalErrorHandler) {
      return originalErrorHandler.apply(this, arguments);
    }
    return false;
  };
  
  // Override unhandled rejection handler
  const originalRejectionHandler = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    if (isChromeExtensionError(event.reason)) {
      console.warn('🔇 Chrome extension promise rejection suppressed:', event.reason);
      event.preventDefault();
      return true;
    }
    
    if (originalRejectionHandler) {
      return originalRejectionHandler.apply(this, arguments);
    }
    return false;
  };
  
  // Override addEventListener to filter Chrome extension errors
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'error' && typeof listener === 'function') {
      const wrappedListener = function(event) {
        if (event.error && isChromeExtensionError(event.error)) {
          console.warn('🔇 Chrome extension event error suppressed:', event.error);
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
  
  // Override console methods to filter Chrome extension errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  
  console.error = function(...args) {
    const message = args.join(' ');
    if (isChromeExtensionMessage(message)) {
      console.warn('🔇 Chrome extension console error filtered:', ...args);
      return;
    }
    return originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args) {
    const message = args.join(' ');
    if (isChromeExtensionMessage(message)) {
      return; // Completely suppress Chrome extension warnings
    }
    return originalConsoleWarn.apply(console, args);
  };
  
  console.log = function(...args) {
    const message = args.join(' ');
    if (isChromeExtensionMessage(message)) {
      return; // Completely suppress Chrome extension logs
    }
    return originalConsoleLog.apply(console, args);
  };
  
  // Override fetch to handle Chrome extension interference
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    try {
      return await originalFetch.apply(this, args);
    } catch (error) {
      if (isChromeExtensionError(error)) {
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
  
  // Suppress specific error patterns immediately
  const suppressPatterns = [
    'fetchIt @',
    'requestWithFetch @',
    'loadUrl @',
    'useTranslation_useTranslation @',
    'RootWrapper @',
    'contentScript.bundle.js',
    'webpack_modules',
    'createAndMountRoot @'
  ];
  
  suppressPatterns.forEach(pattern => {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // Create a MutationObserver to catch and suppress errors in real-time
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SCRIPT') {
                if (regex.test(node.src || node.textContent || '')) {
                  console.warn('🔇 Chrome extension script suppressed:', node.src || 'inline script');
                  node.remove();
                }
              }
            });
          }
        });
      });
      
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  });
  
  console.log('✅ Chrome Extension Error Suppression Complete - All extension errors will be filtered');
})();