// Enhanced Error Boundary with Better Error Handling
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = Date.now().toString();
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    });

    // Log critical errors
    if (error.message.includes('Cannot read properties') || 
        error.message.includes('user') ||
        error.message.includes('auth')) {
      console.error('Critical Error Caught:', {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReload = () => {
    // Clear potentially corrupted data
    try {
      const criticalKeys = ['user', 'token'];
      criticalKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            JSON.parse(value);
          } catch {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
    
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const isAuthError = this.state.error?.message?.includes('user') || 
                         this.state.error?.message?.includes('auth') ||
                         this.state.error?.message?.includes('Cannot read properties');

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
          <div className="text-center max-w-md w-full">
            <div className="text-6xl mb-4">{isAuthError ? '🔐' : '⚠️'}</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {isAuthError ? 'Authentication Error' : 'Something went wrong'}
            </h1>
            <p className="text-slate-400 mb-6">
              {isAuthError 
                ? 'There was an issue with user authentication. Please try logging in again.'
                : 'We\'re sorry, but something unexpected happened.'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              
              {isAuthError && (
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/login';
                  }}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Data & Login
                </button>
              )}
            </div>
            
            {this.state.errorId && (
              <p className="mt-4 text-xs text-slate-500">
                Error ID: {this.state.errorId}
              </p>
            )}
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-slate-300 hover:text-white">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-4 bg-slate-800 rounded text-red-400 text-sm overflow-auto max-h-60">
                  <div className="font-bold mb-2">Error Message:</div>
                  <div className="mb-4">{this.state.error.toString()}</div>
                  
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <div className="font-bold mb-2">Component Stack:</div>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;