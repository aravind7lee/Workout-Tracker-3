// Error suppression utility to prevent continuous console errors
const suppressedErrors = new Set();
const errorCounts = new Map();
const MAX_ERROR_COUNT = 3;
const RESET_INTERVAL = 30000; // 30 seconds

// Reset error counts periodically
setInterval(() => {
  errorCounts.clear();
}, RESET_INTERVAL);

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  
  // Suppress specific error patterns
  if (
    message.includes('Failed to load resource') ||
    message.includes('404 (Not Found)') ||
    message.includes('Unexpected end of JSON input') ||
    message.includes('Extension context invalidated') ||
    message.includes('chrome-extension://') ||
    message.includes('message channel closed') ||
    message.includes('listener indicated an asynchronous response')
  ) {
    const errorKey = message.substring(0, 100); // Use first 100 chars as key
    const count = errorCounts.get(errorKey) || 0;
    
    if (count < MAX_ERROR_COUNT) {
      errorCounts.set(errorKey, count + 1);
      originalConsoleError.apply(console, args);
    }
    return;
  }
  
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  
  // Suppress specific warning patterns
  if (
    message.includes('Extension context invalidated') ||
    message.includes('chrome-extension://') ||
    message.includes('Storage quota exceeded')
  ) {
    return;
  }
  
  originalConsoleWarn.apply(console, args);
};

export default {
  suppressError: (errorPattern) => {
    suppressedErrors.add(errorPattern);
  },
  
  unsuppressError: (errorPattern) => {
    suppressedErrors.delete(errorPattern);
  },
  
  clearSuppressed: () => {
    suppressedErrors.clear();
    errorCounts.clear();
  }
};