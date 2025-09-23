// Enhanced Error Boundary - Catches All Errors
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Suppress all errors silently
    this.setState({
      error: error,
      errorInfo: errorInfo,
      hasError: true
    });
  }

  render() {
    if (this.state.hasError) {
      // Return the children anyway - don't show error UI
      return this.props.children;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;