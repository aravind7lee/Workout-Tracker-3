import { AlertTriangle } from 'lucide-react';
import React from "react";


class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "min-h-screen bg-black flex items-center justify-center p-4",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "card max-w-md w-full text-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-6xl mb-4",
            },
            /*#__PURE__*/ React.createElement(AlertTriangle, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "h2",
            {
              className: "text-xl font-bold text-white mb-4",
            },
            "Dashboard Error",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-400 mb-6",
            },
            "There was an issue loading the dashboard. Please refresh the page.",
          ),
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: () => window.location.reload(),
              className: "btn bg-red-700 hover:bg-blue-700 text-white w-full",
            },
            "Reload Dashboard",
          ),
        ),
      );
    }
    return this.props.children;
  }
}
export default DashboardErrorBoundary;
