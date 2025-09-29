// frontend/src/components/ChromeErrorBoundary.jsx
import React from 'react';

class ChromeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Filter out Chrome extension and network errors immediately
    const errorMessage = error?.message || error?.toString() || '';
    const isChromeExtensionError = 
      errorMessage.includes('Extension context invalidated') ||
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('listener indicated an asynchronous response') ||
      errorMessage.includes('chrome-extension:') ||
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('Loading CSS chunk') ||
      errorMessage.includes('Network Error') ||
      errorMessage.includes('fetch') ||
      error?.stack?.includes('chrome-extension://');

    if (isChromeExtensionError) {
      // Don't show error UI for Chrome extension errors
      return { hasError: false };
    }
    
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Filter out Chrome extension errors
    const errorMessage = error?.message || error?.toString() || '';
    const isChromeExtensionError = 
      errorMessage.includes('Extension context invalidated') ||
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('listener indicated an asynchronous response') ||
      errorMessage.includes('chrome-extension:') ||
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('Loading CSS chunk') ||
      errorMessage.includes('Network Error') ||
      errorMessage.includes('fetch') ||
      error?.stack?.includes('chrome-extension://');

    if (isChromeExtensionError) {
      // Don't show error UI for Chrome extension errors
      this.setState({ hasError: false, error: null, errorInfo: null });
      return;
    }

    // Log the error but don't throw it
    console.warn('Chrome Extension Error Caught:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError && !this.isChromeExtensionError()) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                The application encountered an error. Please refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  isChromeExtensionError() {
    const error = this.state.error;
    if (!error) return false;
    
    return (
      error.message?.includes('Extension context invalidated') ||
      error.message?.includes('message channel closed') ||
      error.message?.includes('listener indicated an asynchronous response') ||
      error.stack?.includes('chrome-extension://')
    );
  }
}

export default ChromeErrorBoundary;