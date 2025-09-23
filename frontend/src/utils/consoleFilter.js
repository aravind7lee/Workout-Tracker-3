// frontend/src/utils/consoleFilter.js - Filter console warnings
const originalWarn = console.warn;
const originalLog = console.log;

console.warn = (...args) => {
  const message = args.join(' ');
  
  // Filter out React DevTools warning
  if (message.includes('Download the React DevTools')) {
    return;
  }
  
  originalWarn.apply(console, args);
};

console.log = (...args) => {
  const message = args.join(' ');
  
  // Filter out light mode test messages
  if (message.includes('Currently in dark mode') || message.includes('light mode')) {
    return;
  }
  
  originalLog.apply(console, args);
};

export default {};