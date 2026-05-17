import { CheckCircle2 } from 'lucide-react';
import React from "react";


// Simple test component to verify React is working
const TestReact = () => {
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      style: {
        padding: "20px",
        textAlign: "center",
      },
    },
    /*#__PURE__*/ React.createElement(
      "h1",
      null,
      "React is Working! ",
      /*#__PURE__*/ React.createElement(CheckCircle2, {
        className: "w-[1em] h-[1em] inline-block",
      }),
    ),
    /*#__PURE__*/ React.createElement(
      "p",
      null,
      "If you can see this, React refresh runtime is functioning correctly.",
    ),
  );
};
export default TestReact;
