// Console filter to suppress development warnings
const originalWarn = console.warn;
const originalLog = console.log;
const originalError = console.error;

console.warn = (...args) => {
  const message = args.join(' ');
  
  // Filter out React DevTools warning
  if (message.includes('Download the React DevTools')) {
    return;
  }
  
  // Filter out React Router future flag warnings
  if (message.includes('React Router Future Flag Warning') ||
      message.includes('v7_startTransition') ||
      message.includes('v7_relativeSplatPath')) {
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

console.error = (...args) => {
  const message = args.join(' ');
  
  // Filter out React Router warnings that appear as errors
  if (message.includes('React Router Future Flag Warning') ||
      message.includes('v7_startTransition') ||
      message.includes('v7_relativeSplatPath')) {
    return;
  }
  
  originalError.apply(console, args);
};

export default {};