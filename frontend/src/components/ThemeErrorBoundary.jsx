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
    // Suppress theme-related errors
    const errorMessage = error?.message || '';
    if (errorMessage.includes('theme is not defined') || 
        errorMessage.includes('useTheme must be used within') ||
        errorMessage.includes('Theme Context Error')) {
      // Silently handle theme errors
      return;
    }
    
    console.error('Theme Context Error:', error, errorInfo);
    
    // Try to recover by applying default theme
    try {
      document.documentElement.classList.add('dark');
      document.body.className = 'dark-theme';
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } catch (recoveryError) {
      // Silently handle recovery errors
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Theme System Error</h2>
            <p className="text-slate-400 mb-4">There was an issue with the theme system.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ThemeErrorBoundary;