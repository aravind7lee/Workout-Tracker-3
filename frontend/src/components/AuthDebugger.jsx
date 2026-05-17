// frontend/src/components/AuthDebugger.jsx
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import React from "react";
import { useAuth } from "../context/AuthContext";


const AuthDebugger = () => {
  const { user, token, isAuthenticated } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV === "production") return null;
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "fixed bottom-4 right-4 bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-xs text-white z-50 max-w-xs",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "font-bold mb-2",
      },
      /*#__PURE__*/ React.createElement(Search, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      " Auth Debug",
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      null,
      "Token: ",
      token ? <><CheckCircle2 className="w-[1em] h-[1em] inline-block text-green-500"/> Present</> : <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> Missing</>,
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      null,
      "User: ",
      user ? <><CheckCircle2 className="w-[1em] h-[1em] inline-block text-green-500"/> Present</> : <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> Missing</>,
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      null,
      "User ID: ",
      user?.id || user?._id || <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> Missing</>,
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      null,
      "User Name: ",
      user?.name || <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> Missing</>,
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      null,
      "User Email: ",
      user?.email || <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> Missing</>,
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      null,
      "Authenticated: ",
      isAuthenticated() ? <><CheckCircle2 className="w-[1em] h-[1em] inline-block text-green-500"/> Yes</> : <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> No</>,
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "mt-2 text-xs text-neutral-400",
      },
      "Check console for detailed logs",
    ),
  );
};
export default AuthDebugger;
