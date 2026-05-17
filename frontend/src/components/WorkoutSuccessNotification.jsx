// Workout Success Notification Component
import { PartyPopper } from 'lucide-react';
import React, { useState, useEffect } from "react";


export default function WorkoutSuccessNotification({
  message,
  onClose,
  duration = 5000,
}) {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  if (!isVisible) return null;
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "fixed top-4 right-4 z-50 animate-fade-in-slide",
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
        /*#__PURE__*/ React.createElement(PartyPopper, {
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
            className: "text-sm opacity-90",
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
          className: "text-white hover:text-gray-200 text-xl",
        },
        "\xD7",
      ),
    ),
  );
}
