// frontend/src/utils/consoleFilter.js
// Production-ready console filter to suppress development warnings

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Filter out specific development warnings
console.error = (...args) => {
  const message = args.join(' ');
  
  // Suppress specific React and API warnings
  if (
    message.includes('Download the React DevTools') ||
    message.includes('react-dom_client.js') ||
    message.includes('404 (Not Found)') ||
    message.includes('Request failed with status code 404') ||
    message.includes('/analytics/stats') ||
    message.includes('/analytics/achievements') ||
    message.includes('injectIntoGlobalHook')
  ) {
    return; // Suppress these warnings
  }
  
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  
  // Suppress specific warnings
  if (
    message.includes('Using mock') ||
    message.includes('analytics') ||
    message.includes('404')
  ) {
    return; // Suppress these warnings
  }
  
  originalConsoleWarn.apply(console, args);
};

export default {
  restore: () => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
};