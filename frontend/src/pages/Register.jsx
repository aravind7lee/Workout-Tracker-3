// Fixed Register Page with Offline Support
import { Star, Edit } from 'lucide-react';
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser, checkBackendStatus } from "../services/authService";
import heroImg from "../assets/Heroimg.jpg";


const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  useEffect(() => {
    const checkBackend = async () => {
      const status = await checkBackendStatus();
      setBackendStatus(status.online ? "online" : "offline");
    };
    checkBackend();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time password matching validation
    if (
      name === "confirmPassword" ||
      (name === "password" && formData.confirmPassword)
    ) {
      const password = name === "password" ? value : formData.password;
      const confirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;
      if (confirmPassword.length > 0) {
        setPasswordMatch(password === confirmPassword);
      } else {
        setPasswordMatch(null);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      return setError("All fields are required!");
    }
    setLoading(true);
    try {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      login(result.user, result.token);
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
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
        "absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,69,19,0.15),transparent_50%)] animate-pulse",
    }),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "bg-gradient-to-b from-black/15 to-black/25 backdrop-blur-sm border border-red-600/30 rounded-xl p-4 sm:p-6 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md relative z-10",
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
          "Create Account",
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className:
              "text-xs sm:text-sm text-red-200/70 font-medium tracking-wide px-2",
          },
          "Join the ultimate fitness experience",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: `mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded border border-red-800/30 text-[10px] sm:text-xs font-mono backdrop-blur-sm ${backendStatus === "online" ? "bg-red-950/40 text-red-300 border-red-800/50" : "bg-red-950/40 text-red-300 border-red-800/50"}`,
          },
          backendStatus === "online"
            ? "● DATABASE CONNECTED"
            : "● LOCAL STORAGE MODE",
        ),
      ),
      error &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-red-950/50 border border-red-600/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6 backdrop-blur-sm",
          },
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-red-200 text-xs sm:text-sm font-medium",
            },
            /*#__PURE__*/ React.createElement(Star, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " ",
            error,
          ),
        ),
      /*#__PURE__*/ React.createElement(
        "form",
        {
          onSubmit: handleSubmit,
          className: "space-y-4 sm:space-y-5 md:space-y-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement("input", {
            type: "text",
            name: "name",
            placeholder: "Full Name",
            className:
              "w-full p-3 sm:p-3.5 md:p-4 rounded-lg bg-neutral-900/80 border border-red-900/30 text-red-100 placeholder-red-600/50 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all duration-300 font-medium backdrop-blur-sm uppercase tracking-wide text-xs sm:text-sm",
            value: formData.name,
            onChange: handleChange,
            required: true,
            disabled: loading,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement("input", {
            type: "email",
            name: "email",
            placeholder: "Email Address",
            className:
              "w-full p-3 sm:p-3.5 md:p-4 rounded-lg bg-neutral-900/80 border border-red-900/30 text-red-100 placeholder-red-600/50 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all duration-300 font-medium backdrop-blur-sm text-xs sm:text-sm",
            value: formData.email,
            onChange: handleChange,
            required: true,
            disabled: loading,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "relative",
            },
            /*#__PURE__*/ React.createElement("input", {
              type: showPassword ? "text" : "password",
              name: "password",
              placeholder: "Password",
              className:
                "w-full p-3 sm:p-3.5 md:p-4 pr-12 sm:pr-14 rounded-lg bg-neutral-900/80 border border-red-900/30 text-red-100 placeholder-red-600/50 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all duration-300 font-medium backdrop-blur-sm text-xs sm:text-sm",
              value: formData.password,
              onChange: handleChange,
              required: true,
              disabled: loading,
            }),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className:
                  "absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-red-600/70 hover:text-red-400 transition-colors duration-200",
                tabIndex: -1,
                disabled: loading,
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
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "relative",
            },
            /*#__PURE__*/ React.createElement("input", {
              type: showConfirmPassword ? "text" : "password",
              name: "confirmPassword",
              placeholder: "Confirm Password",
              className: `w-full p-3 sm:p-3.5 md:p-4 pr-12 sm:pr-14 rounded-lg bg-neutral-900/80 border text-red-100 placeholder-red-600/50 focus:outline-none focus:ring-2 transition-all duration-300 font-medium backdrop-blur-sm text-xs sm:text-sm ${passwordMatch === null ? "border-red-900/30 focus:border-red-600 focus:ring-red-600/20" : passwordMatch ? "border-red-600/50 focus:border-red-600 focus:ring-red-600/20" : "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"}`,
              value: formData.confirmPassword,
              onChange: handleChange,
              required: true,
              disabled: loading,
            }),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                type: "button",
                onClick: () => setShowConfirmPassword(!showConfirmPassword),
                className:
                  "absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-red-600/70 hover:text-red-400 transition-colors duration-200",
                tabIndex: -1,
                disabled: loading,
              },
              showConfirmPassword
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
          passwordMatch !== null &&
            formData.confirmPassword.length > 0 &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: `mt-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 ${passwordMatch ? "text-red-500" : "text-red-400"}`,
              },
              passwordMatch
                ? /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(
                      "svg",
                      {
                        className: "w-3 h-3 sm:w-4 sm:h-4",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                      },
                      /*#__PURE__*/ React.createElement("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M5 13l4 4L19 7",
                      }),
                    ),
                    "Passwords match",
                  )
                : /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(
                      "svg",
                      {
                        className: "w-3 h-3 sm:w-4 sm:h-4",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                      },
                      /*#__PURE__*/ React.createElement("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M6 18L18 6M6 6l12 12",
                      }),
                    ),
                    "Passwords do not match",
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
          loading ? "Creating Account..." : "Create Account",
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "mt-6 sm:mt-7 md:mt-8 text-center",
        },
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-red-300/70 text-xs sm:text-sm font-medium",
          },
          "Already have an account?",
          " ",
          /*#__PURE__*/ React.createElement(
            Link,
            {
              to: "/login",
              className:
                "text-red-400 hover:text-red-300 font-bold tracking-wide transition-colors duration-200",
            },
            "Sign In",
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "mt-4 sm:mt-5 md:mt-6 p-3 sm:p-4 bg-neutral-900/50 border border-red-900/20 rounded-lg backdrop-blur-sm",
        },
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className:
              "text-red-300/70 text-[10px] sm:text-xs md:text-sm text-center mb-2 sm:mb-3 font-medium",
          },
          "Quick Test Registration:",
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: () =>
              setFormData({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                confirmPassword: "password123",
              }),
            className:
              "w-full px-3 py-2 sm:px-4 sm:py-2 bg-red-800/30 hover:bg-red-700/40 rounded text-[10px] sm:text-xs md:text-sm text-red-300 transition-all duration-200 font-medium tracking-wide border border-red-800/30",
            disabled: loading,
          },
          /*#__PURE__*/ React.createElement(Edit, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          " Fill Test Data",
        ),
      ),
    ),
  );
};
export default Register;
