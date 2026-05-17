// Success Notification Component
import { CheckCircle2 } from 'lucide-react';
import React, { useEffect, useState } from "react";


const SuccessNotification = ({ message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  if (!isVisible) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "fixed top-4 right-4 z-50 transform transition-all duration-300 translate-x-full opacity-0",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-2xl",
          },
          /*#__PURE__*/ React.createElement(CheckCircle2, {
            className: "w-[1em] h-[1em] inline-block",
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "font-semibold",
            },
            "Workout Completed!",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-sm text-green-100",
            },
            message,
          ),
        ),
      ),
    );
  }
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "fixed top-4 right-4 z-50 transform transition-all duration-300",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-2xl",
        },
        /*#__PURE__*/ React.createElement(CheckCircle2, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex-1",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "font-semibold",
          },
          "Workout Completed!",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-sm text-green-100",
          },
          message,
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "button",
        {
          onClick: () => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          },
          className: "text-green-100 hover:text-white text-xl ml-2",
        },
        "\xD7",
      ),
    ),
  );
};
export default SuccessNotification;
