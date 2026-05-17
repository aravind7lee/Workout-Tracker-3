// Professional authentication guard component
import { Lock, Dumbbell, BarChart3, Utensils, ClipboardList, Trophy, Cloud, TrendingUp, Key, Rocket } from 'lucide-react';
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "../hooks/useAuthGuard";


const AuthGuard = ({ children, showLoginPrompt = true }) => {
  const { isAuthenticated, loading, user } = useAuthGuard();
  const navigate = useNavigate();
  if (loading) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "flex items-center justify-center min-h-[400px]",
      },
      /*#__PURE__*/ React.createElement(
        motion.div,
        {
          className: "text-center",
          initial: {
            opacity: 0,
          },
          animate: {
            opacity: 1,
          },
        },
        /*#__PURE__*/ React.createElement("div", {
          className:
            "animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4",
        }),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-neutral-400",
          },
          "Checking authentication...",
        ),
      ),
    );
  }
  if (!isAuthenticated && showLoginPrompt) {
    return /*#__PURE__*/ React.createElement(
      motion.div,
      {
        className: "max-w-2xl mx-auto text-center py-12",
        initial: {
          opacity: 0,
          y: 20,
        },
        animate: {
          opacity: 1,
          y: 0,
        },
        transition: {
          duration: 0.5,
        },
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "card p-8",
        },
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            className: "text-6xl mb-6",
            initial: {
              scale: 0.8,
            },
            animate: {
              scale: 1,
            },
            transition: {
              delay: 0.2,
            },
          },
          /*#__PURE__*/ React.createElement(Lock, {
            className: "w-[1em] h-[1em] inline-block",
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "h2",
          {
            className: "text-2xl font-bold text-white mb-4",
          },
          "Login Required for Real-Time Tracking",
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-neutral-400 mb-6 leading-relaxed",
          },
          "To track your workouts, meals, and progress in real-time across all devices, please log in to your GymTracker account.",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "bg-neutral-900/50 rounded-lg p-4 mb-6",
          },
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-white font-semibold mb-3",
            },
            /*#__PURE__*/ React.createElement(Dumbbell, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Professional Features Available After Login:",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-300",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-red-500",
                },
                /*#__PURE__*/ React.createElement(BarChart3, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              "Real-time progress tracking",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-red-500",
                },
                /*#__PURE__*/ React.createElement(Utensils, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              "Nutrition logging & analytics",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-red-600",
                },
                /*#__PURE__*/ React.createElement(ClipboardList, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              "Custom workout plans",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-orange-400",
                },
                /*#__PURE__*/ React.createElement(Trophy, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              "Achievement system",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-red-500",
                },
                /*#__PURE__*/ React.createElement(Cloud, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              "Cross-device synchronization",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-yellow-400",
                },
                /*#__PURE__*/ React.createElement(TrendingUp, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              "Advanced analytics",
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex gap-4 justify-center",
          },
          /*#__PURE__*/ React.createElement(
            motion.button,
            {
              onClick: () => {
                console.log("Navigating to login...");
                navigate("/login", {
                  replace: true,
                });
              },
              className:
                "btn bg-red-700 hover:bg-blue-700 text-white px-6 py-3",
              whileHover: {
                scale: 1.05,
              },
              whileTap: {
                scale: 0.95,
              },
            },
            /*#__PURE__*/ React.createElement(Key, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Login to Track Progress",
          ),
          /*#__PURE__*/ React.createElement(
            motion.button,
            {
              onClick: () => {
                console.log("Navigating to register...");
                navigate("/register", {
                  replace: true,
                });
              },
              className:
                "btn bg-green-600 hover:bg-green-700 text-white px-6 py-3",
              whileHover: {
                scale: 1.05,
              },
              whileTap: {
                scale: 0.95,
              },
            },
            /*#__PURE__*/ React.createElement(Rocket, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Create Account",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-xs text-neutral-500 mt-4",
          },
          "Your data will be securely stored and synced across all your devices",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mt-6 pt-4 border-t border-neutral-800",
          },
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-sm text-neutral-400 mb-3",
            },
            "Or continue browsing:",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex flex-wrap gap-2 justify-center",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  navigate("/", {
                    replace: true,
                  }),
                className: "text-red-500 hover:text-blue-300 text-sm underline",
              },
              "Home",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-neutral-700",
              },
              "\u2022",
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  navigate("/library", {
                    replace: true,
                  }),
                className: "text-red-500 hover:text-blue-300 text-sm underline",
              },
              "Exercise Library",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-neutral-700",
              },
              "\u2022",
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  navigate("/dashboard", {
                    replace: true,
                  }),
                className: "text-red-500 hover:text-blue-300 text-sm underline",
              },
              "Dashboard",
            ),
          ),
        ),
      ),
    );
  }
  if (!isAuthenticated && !showLoginPrompt) {
    return null;
  }
  return children;
};
export default AuthGuard;
