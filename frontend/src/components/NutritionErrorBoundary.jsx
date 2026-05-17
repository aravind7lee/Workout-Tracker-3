import { AlertTriangle } from 'lucide-react';
import React from "react";


class NutritionErrorBoundary extends React.Component {
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
    console.error("Nutrition component error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "card",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-center py-8",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-4xl mb-3",
            },
            /*#__PURE__*/ React.createElement(AlertTriangle, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-lg font-semibold text-white mb-2",
            },
            "Something went wrong",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-400 mb-4",
            },
            "There was an error loading the nutrition tracker.",
          ),
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: () =>
                this.setState({
                  hasError: false,
                  error: null,
                }),
              className: "btn bg-red-700 hover:bg-red-800 text-white",
            },
            "Try Again",
          ),
        ),
      );
    }
    return this.props.children;
  }
}
export default NutritionErrorBoundary;
