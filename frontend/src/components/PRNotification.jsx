// PR Notification Component - Real-time PR alerts
import { Trophy, PartyPopper } from 'lucide-react';
import React, { useState, useEffect } from "react";


export default function PRNotification() {
  const [prAlert, setPrAlert] = useState(null);
  useEffect(() => {
    const handleNewPR = (event) => {
      const { exerciseName, newPRs } = event.detail;
      setPrAlert({
        exerciseName,
        newPRs,
      });

      // Auto-hide after 6 seconds
      setTimeout(() => {
        setPrAlert(null);
      }, 6000);
    };
    window.addEventListener("newPRRecord", handleNewPR);
    return () => window.removeEventListener("newPRRecord", handleNewPR);
  }, []);
  if (!prAlert) return null;
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white p-6 rounded-xl shadow-2xl animate-bounce max-w-sm border-2 border-yellow-300",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "text-center",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-4xl mb-3 animate-pulse",
        },
        /*#__PURE__*/ React.createElement(Trophy, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-2xl font-bold mb-2 text-yellow-100",
        },
        "NEW PR!",
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-lg font-semibold mb-4 text-white",
        },
        prAlert.exerciseName,
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "space-y-2 mb-4",
        },
        prAlert.newPRs.map((pr, index) =>
          /*#__PURE__*/ React.createElement(
            "div",
            {
              key: index,
              className:
                "bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "font-bold text-yellow-100",
              },
              pr.type,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-xl font-bold text-white",
              },
              pr.value,
              pr.unit,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-sm text-yellow-200",
              },
              "+",
              pr.improvement,
              pr.unit,
              " improvement!",
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-sm font-semibold text-yellow-200 animate-pulse",
        },
        /*#__PURE__*/ React.createElement(PartyPopper, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        " Outstanding Achievement! ",
        /*#__PURE__*/ React.createElement(PartyPopper, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      ),
      /*#__PURE__*/ React.createElement(
        "button",
        {
          onClick: () => setPrAlert(null),
          className: "mt-3 text-xs text-white/80 hover:text-white underline",
        },
        "Click to dismiss",
      ),
    ),
  );
}
