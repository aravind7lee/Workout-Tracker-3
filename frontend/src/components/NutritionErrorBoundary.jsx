import React from 'react';

class NutritionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Nutrition component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
            <p className="text-slate-400 mb-4">
              There was an error loading the nutrition tracker.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NutritionErrorBoundary;