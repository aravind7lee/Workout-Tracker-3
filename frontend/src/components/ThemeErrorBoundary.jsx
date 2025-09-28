import React from 'react';

class ThemeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Suppress all theme-related errors silently
    const errorMessage = error?.message || '';
    if (errorMessage.includes('theme') || 
        errorMessage.includes('useTheme') ||
        errorMessage.includes('Context') ||
        errorMessage.includes('Provider')) {
      // Silently handle and recover from theme errors
      this.setState({ hasError: false, error: null });
      return;
    }
    
    // Try to recover by applying default theme
    try {
      document.documentElement.classList.add('dark');
      document.body.className = 'dark-theme';
      document.documentElement.setAttribute('data-theme', 'dark');
      // Reset error state after recovery
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 100);
    } catch (recoveryError) {
      // Silently handle recovery errors
    }
  }

  render() {
    // Never show error UI, always try to render children
    return this.props.children;
  }
}

export default ThemeErrorBoundary;