// Error Boundary Component
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Only catch actual React errors, not all errors
    const errorMessage = error?.message || error?.toString() || '';
    const suppressedPatterns = [
      /chrome-extension:/,
      /fetchPriority.*prop.*DOM element/,
      /Failed to load.*data.*SyntaxError/,
      /Unexpected token.*doctype/,
      /Loading chunk/,
      /Loading CSS chunk/,
      /Network Error/,
      /fetch/
    ];
    
    const shouldSuppress = suppressedPatterns.some(pattern => pattern.test(errorMessage));
    
    if (shouldSuppress) {
      return { hasError: false, error: null };
    }
    
    // Log the error for debugging
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Only log actual React component errors
    const errorMessage = error?.message || error?.toString() || '';
    const suppressedPatterns = [
      /chrome-extension:/,
      /fetchPriority.*prop.*DOM element/,
      /Failed to load.*data.*SyntaxError/,
      /Unexpected token.*doctype/,
      /Loading chunk/,
      /Loading CSS chunk/,
      /Network Error/,
      /fetch/
    ];
    
    const shouldSuppress = suppressedPatterns.some(pattern => pattern.test(errorMessage));
    
    if (!shouldSuppress) {
      console.error('React Error caught by boundary:', error, errorInfo);
      console.error('Error stack:', error.stack);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-md w-full text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-neutral-400 mb-4">
              The app encountered an error. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-700 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;