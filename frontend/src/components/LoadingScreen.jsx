import { BicepsFlexed } from 'lucide-react';
import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";


const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 2.5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setVisible(false);
            setTimeout(() => onLoadingComplete?.(), 250);
          }, 150);
          return 100;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onLoadingComplete]);
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);
  if (!visible) return null;
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: `theme-dark-surface loading-screen fixed inset-0 z-[99999] bg-black flex items-center justify-center transition-opacity duration-250 ${visible ? "opacity-100" : "opacity-0"}`,
    },
    /*#__PURE__*/ React.createElement("div", {
      className: "absolute inset-0",
      style: {
        background:
          "radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%)",
      },
    }),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "relative z-10 text-center px-4",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "relative mb-10",
        },
        /*#__PURE__*/ React.createElement("div", {
          className:
            "absolute inset-0 -m-12 blur-3xl transition-all duration-500",
          style: {
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
            transform: `scale(${0.6 + (progress / 100) * 0.6})`,
          },
        }),
        /*#__PURE__*/ React.createElement("img", {
          src: logo,
          alt: "Gym Tracker",
          className:
            "w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain transition-all duration-500",
          style: {
            filter:
              "brightness(1.1) contrast(1.05) drop-shadow(0 0 40px rgba(255,255,255,0.15))",
            transform: `scale(${0.9 + (progress / 100) * 0.2})`,
          },
          loading: "eager",
        }),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "mb-8",
        },
        /*#__PURE__*/ React.createElement(
          "h1",
          {
            className:
              "text-3xl sm:text-4xl font-black tracking-wider text-white mb-2 transition-all duration-500",
            style: {
              textShadow: "0 0 40px rgba(255,255,255,0.2)",
              transform: `scale(${0.95 + (progress / 100) * 0.08})`,
            },
          },
          "WORKOUT TRACKER",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "text-xs text-zinc-600 font-bold tracking-widest uppercase",
          },
          "ELITE FITNESS SYSTEM",
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "w-72 sm:w-80 mx-auto mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "relative h-1.5 bg-zinc-900 overflow-hidden",
            style: {
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.9)",
            },
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "h-full transition-all duration-200 ease-out relative",
              style: {
                width: `${progress}%`,
                background: "linear-gradient(90deg, #ffffff 0%, #e5e5e5 100%)",
                boxShadow:
                  "0 0 20px rgba(255,255,255,0.4), inset 0 1px 2px rgba(255,255,255,0.5)",
              },
            },
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse",
              style: {
                animationDuration: "1.5s",
              },
            }),
            /*#__PURE__*/ React.createElement("div", {
              className: "absolute right-0 top-0 bottom-0 w-4 blur-sm",
              style: {
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
              },
            }),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex justify-center items-center mt-5",
          },
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className:
                "text-2xl font-black font-mono tabular-nums text-white transition-all duration-300",
              style: {
                textShadow: "0 0 20px rgba(255,255,255,0.3)",
              },
            },
            Math.round(progress),
            "%",
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex justify-center items-end gap-1.5 h-8",
        },
        [0, 1, 2, 3, 4, 5, 6].map((i) =>
          /*#__PURE__*/ React.createElement("div", {
            key: i,
            className: "w-1 bg-white transition-all duration-150",
            style: {
              height: `${10 + Math.sin((progress + i * 20) * 0.1) * 18}px`,
              opacity: 0.3 + (progress / 100) * 0.5,
              boxShadow: "0 0 10px rgba(255,255,255,0.3)",
            },
          }),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "mt-10",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "inline-flex items-center gap-2 px-4 py-2 border border-neutral-900 bg-zinc-950/80",
          },
          /*#__PURE__*/ React.createElement("div", {
            className: "w-1 h-1 bg-white animate-pulse",
            style: {
              boxShadow: "0 0 6px rgba(255,255,255,0.6)",
            },
          }),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className:
                "text-[9px] font-black tracking-widest uppercase text-zinc-500",
            },
            /*#__PURE__*/ React.createElement(BicepsFlexed, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " LOADING GRIND X",
          ),
          /*#__PURE__*/ React.createElement("div", {
            className: "w-1 h-1 bg-white animate-pulse",
            style: {
              boxShadow: "0 0 6px rgba(255,255,255,0.6)",
              animationDelay: "0.5s",
            },
          }),
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement("div", {
      className: "absolute inset-0 pointer-events-none opacity-[0.015]",
      style: {
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)",
        animation: "scan 8s linear infinite",
      },
    }),
    /*#__PURE__*/ React.createElement(
      "style",
      null,
      `
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
      `,
    ),
  );
};
export default LoadingScreen;
