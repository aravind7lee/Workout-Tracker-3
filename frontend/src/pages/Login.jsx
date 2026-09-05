// Fixed Login Page with Better Error Handling
import { RefreshCw, BarChart3, LockKeyhole, CheckCircle2, XCircle, Star } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, checkBackendStatus } from "../services/authService";
import heroImg from "../assets/Heroimg.jpg";


const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  useEffect(() => {
    const checkBackend = async () => {
      console.log("🔄 Starting backend status check...");
      const status = await checkBackendStatus();
      console.log("📊 Backend status response:", status);
      setBackendStatus(status.online ? "online" : "offline");
    };
    checkBackend();
  }, []);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }
    console.log("🔐 Login attempt:", {
      email: formData.email,
      hasPassword: !!formData.password,
      backendStatus,
    });
    try {
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      console.log("✅ Login successful, navigating to home");
      login(result.user, result.token);
      navigate(result.user?.onboardingCompleted === false ? "/onboarding" : "/");
    } catch (err) {
      console.error("❌ Login error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "min-h-screen flex items-center justify-center p-3 sm:p-4 relative overflow-hidden",
    },
    /*#__PURE__*/ React.createElement("div", {
      className: "absolute inset-0 bg-cover bg-center bg-no-repeat",
      style: {
        backgroundImage: `url(${heroImg})`,
      },
    }),
    /*#__PURE__*/ React.createElement("div", {
      className: "absolute inset-0 bg-black/50",
    }),
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute inset-0 bg-gradient-to-t from-red-950/20 via-transparent to-red-950/10",
    }),
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,69,19,0.15),transparent_50%)] animate-pulse",
    }),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "w-full max-w-md relative z-10",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-center mb-4 sm:mb-6 md:mb-8",
        },
        /*#__PURE__*/ React.createElement(
          "h1",
          {
            className:
              "text-2xl sm:text-3xl md:text-4xl font-black text-red-100 mb-2 sm:mb-3 tracking-tight drop-shadow-2xl",
          },
          "Welcome Back",
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className:
              "text-xs sm:text-sm text-red-200/70 font-medium tracking-wide px-2",
          },
          "Sign in to your workout tracker account",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: `mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded border border-red-800/30 text-[10px] sm:text-xs font-mono backdrop-blur-sm ${backendStatus === "online" ? "bg-red-950/40 text-red-300 border-red-800/50" : backendStatus === "checking" ? "bg-blue-950/40 text-blue-300 border-blue-800/50" : "bg-red-950/40 text-red-300 border-red-800/50"}`,
          },
          backendStatus === "online"
            ? "● SYSTEM ONLINE"
            : backendStatus === "checking"
              ? "● CONNECTING..."
              : "● OFFLINE MODE",
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "form",
        {
          onSubmit: handleSubmit,
          className:
            "bg-zinc-900/95 border border-zinc-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-5 md:space-y-6",
        },
        /*#__PURE__*/ React.createElement(
          "h2",
          {
            className:
              "text-lg sm:text-xl md:text-2xl font-bold text-red-100 mb-4 sm:mb-5 md:mb-6 tracking-wide",
          },
          "Login",
        ),
        error &&
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "bg-red-950/50 border border-red-600/50 rounded-lg p-3 sm:p-4 text-red-200 text-xs sm:text-sm font-medium backdrop-blur-sm",
            },
            /*#__PURE__*/ React.createElement(Star, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " ",
            error,
          ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-[10px] sm:text-xs md:text-sm font-bold text-red-200 mb-2 sm:mb-2.5 md:mb-3 tracking-wide uppercase",
            },
            "Email",
          ),
          /*#__PURE__*/ React.createElement("input", {
            type: "email",
            name: "email",
            placeholder: "Enter your email",
            className:
              "w-full p-3 sm:p-3.5 md:p-4 rounded-lg bg-neutral-900/80 border border-red-900/30 text-red-100 placeholder-red-600/50 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all duration-300 font-medium backdrop-blur-sm text-xs sm:text-sm",
            value: formData.email,
            onChange: handleChange,
            required: true,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-[10px] sm:text-xs md:text-sm font-bold text-red-200 mb-2 sm:mb-2.5 md:mb-3 tracking-wide uppercase",
            },
            "Password",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "relative",
            },
            /*#__PURE__*/ React.createElement("input", {
              type: showPassword ? "text" : "password",
              name: "password",
              placeholder: "Enter your password",
              className:
                "w-full p-3 sm:p-3.5 md:p-4 pr-12 sm:pr-14 rounded-lg bg-neutral-900/80 border border-red-900/30 text-red-100 placeholder-red-600/50 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all duration-300 font-medium backdrop-blur-sm text-xs sm:text-sm",
              value: formData.password,
              onChange: handleChange,
              required: true,
            }),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className:
                  "absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-red-600/70 hover:text-red-400 transition-colors duration-200",
                tabIndex: -1,
              },
              showPassword
                ? /*#__PURE__*/ React.createElement(
                    "svg",
                    {
                      className: "w-4 h-4 sm:w-5 sm:h-5",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24",
                    },
                    /*#__PURE__*/ React.createElement("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21",
                    }),
                  )
                : /*#__PURE__*/ React.createElement(
                    "svg",
                    {
                      className: "w-4 h-4 sm:w-5 sm:h-5",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24",
                    },
                    /*#__PURE__*/ React.createElement("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
                    }),
                    /*#__PURE__*/ React.createElement("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
                    }),
                  ),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            type: "submit",
            disabled: loading,
            className:
              "w-full p-3 sm:p-3.5 md:p-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-red-100 font-bold tracking-wide uppercase rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-red-600/25 text-xs sm:text-sm",
          },
          loading ? "Signing in..." : "Sign In",
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className:
              "text-center text-xs sm:text-sm text-red-300/70 mt-6 sm:mt-7 md:mt-8 font-medium",
          },
          "Don't have an account?",
          " ",
          /*#__PURE__*/ React.createElement(
            Link,
            {
              to: "/register",
              className:
                "text-red-400 hover:text-red-300 font-bold tracking-wide transition-colors duration-200",
            },
            "Sign up here",
          ),
        ),
      ),
    ),
  );
};
export default Login;
