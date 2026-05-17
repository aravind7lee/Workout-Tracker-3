import React from 'react';

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="card max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-4">Dashboard Error</h2>
            <p className="text-neutral-400 mb-6">
              There was an issue loading the dashboard. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn bg-red-700 hover:bg-blue-700 text-white w-full"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;