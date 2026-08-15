// Safe error reporting utility (Development logging preserved, production error boundary support)
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error Handler] ${context}:`, error);
  }
};

export default { logError };

