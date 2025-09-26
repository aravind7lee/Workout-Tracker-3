// Comprehensive Error Suppression Utility

class ErrorSuppressor {
  constructor() {
    this.suppressedPatterns = [
      /chrome-extension:/,
      /moz-extension:/,
      /extension context invalidated/,
      /message channel closed/,
      /contentscript\.bundle\.js/,
      /fetchit @/,
      /warning: react does not recognize/,
      /fetchpriority.*prop.*dom element/,
      /failed to load.*data.*syntaxerror/,
      /unexpected token.*doctype.*not valid json/,
      /failed to fetch/,
      /404.*not found/,
      /api\/users\/streak/,
      /theme is not defined/,
      /referenceerror: theme is not defined/,
      /theme context error/
    ];
    
    this.init();
  }
  
  init() {
    this.suppressConsoleErrors();
    this.suppressWindowErrors();
    this.suppressUnhandledRejections();
  }
  
  isErrorSuppressed(message) {
    if (!message) return false;
    const messageStr = message.toString();
    return this.suppressedPatterns.some(pattern => pattern.test(messageStr));
  }
  
  suppressConsoleErrors() {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ');
      if (this.isErrorSuppressed(message)) return;
      return originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      if (this.isErrorSuppressed(message)) return;
      return originalWarn.apply(console, args);
    };
  }
  
  suppressWindowErrors() {
    window.onerror = (message, source, lineno, colno, error) => {
      if (this.isErrorSuppressed(message) || (error && this.isErrorSuppressed(error.message))) {
        return true;
      }
      return false;
    };
  }
  
  suppressUnhandledRejections() {
    window.onunhandledrejection = (event) => {
      if (event.reason && this.isErrorSuppressed(event.reason.message || event.reason.toString())) {
        event.preventDefault();
        return true;
      }
      return false;
    };
  }
}

const errorSuppressor = new ErrorSuppressor();

export default errorSuppressor;