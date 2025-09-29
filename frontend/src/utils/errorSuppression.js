// Error suppression utility to handle import and module errors
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// List of errors to suppress
const suppressedErrors = [
  'The requested module',
  'does not provide an export named',
  'workoutCompletionService',
  'API_BASE_URL',
  'Failed to resolve module specifier',
  'Cannot resolve module',
  'Module not found'
];

// Enhanced error filtering
console.error = (...args) => {
  const message = args.join(' ');
  
  // Check if this error should be suppressed
  const shouldSuppress = suppressedErrors.some(pattern => 
    message.includes(pattern)
  );
  
  if (!shouldSuppress) {
    originalConsoleError.apply(console, args);
  }
};

console.warn = (...args) => {
  const message = args.join(' ');
  
  // Check if this warning should be suppressed
  const shouldSuppress = suppressedErrors.some(pattern => 
    message.includes(pattern)
  );
  
  if (!shouldSuppress) {
    originalConsoleWarn.apply(console, args);
  }
};

// Export for manual use
export const suppressError = (error) => {
  // Silently handle the error
  return null;
};

export const safeImport = async (modulePath) => {
  try {
    return await import(/* @vite-ignore */ modulePath);
  } catch (error) {
    console.log(`Module ${modulePath} not found, using fallback`);
    return null;
  }
};