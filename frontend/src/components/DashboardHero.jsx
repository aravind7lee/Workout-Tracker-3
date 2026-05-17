import { Star } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import dashboardHeaderImg from "../assets/Dashboardheader.jpg";


const DashboardHero = () => {
  let theme = "dark";
  try {
    const themeContext = useTheme();
    theme = themeContext?.theme || "dark";
  } catch (error) {
    // Fallback to dark theme if context fails
    theme = "dark";
  }
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // LQIP for Dashboard
  const DASHBOARD_LQIP =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.1,
        staggerChildren: 0.06,
        delayChildren: 0.08,
      },
    },
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setTimeout(() => setIsVisible(true), 100);
    };
    img.onerror = () => setImageError(true);
    img.src = dashboardHeaderImg;
    img.loading = "eager";
  }, []);
  return /*#__PURE__*/ React.createElement(
    motion.div,
    {
      initial: {
        opacity: 0,
        y: 12,
      },
      animate: {
        opacity: 1,
        y: 0,
      },
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
      className:
        "dashboard-hero relative w-full h-screen min-h-[100vh] max-h-screen overflow-hidden mb-0 bg-black",
      role: "banner",
      "aria-label": "Dashboard header section",
    },
    /*#__PURE__*/ React.createElement("img", {
      src: DASHBOARD_LQIP,
      alt: "",
      className:
        "absolute inset-0 w-full h-full object-cover blur-sm transition-opacity duration-300",
      style: {
        opacity: imageLoaded ? 0 : 1,
      },
    }),
    !imageError &&
      /*#__PURE__*/ React.createElement(motion.img, {
        initial: {
          opacity: 0,
        },
        animate: {
          opacity: imageLoaded ? 1 : 0,
        },
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
        src: dashboardHeaderImg,
        alt: "Dashboard header \u2013 fitness progress background",
        className:
          "absolute inset-0 w-full h-full object-cover object-center sm:object-center md:object-center",
        loading: "eager",
        decoding: "async",
        fetchpriority: "high",
      }),
    imageError &&
      /*#__PURE__*/ React.createElement("div", {
        className:
          "absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black",
      }),
    /*#__PURE__*/ React.createElement("div", {
      className: "absolute inset-0",
      style: {
        background:
          "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.15) 50%, rgba(0,0,0,0.2) 100%)",
      },
    }),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "absolute inset-0 overflow-hidden pointer-events-none",
      },
      [...Array(8)].map((_, i) =>
        /*#__PURE__*/ React.createElement(motion.div, {
          key: i,
          className: "absolute rounded-full",
          style: {
            width: Math.random() * 4 + 2 + "px",
            height: Math.random() * 4 + 2 + "px",
            background:
              i % 2 === 0
                ? "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(186,230,253,0.2))"
                : "linear-gradient(135deg, rgba(125,211,252,0.4), rgba(56,189,248,0.2))",
          },
          initial: {
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            opacity: 0,
          },
          animate: {
            y: [null, "-30px", "30px"],
            opacity: [0, 0.8, 0],
            rotate: 360,
            scale: [1, 1.2, 1],
          },
          transition: {
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          },
        }),
      ),
    ),
    imageLoaded &&
      isVisible &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "absolute inset-0 flex items-center justify-center text-center px-6 sm:px-8 lg:px-12",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "max-w-5xl mx-auto",
          },
          /*#__PURE__*/ React.createElement(
            motion.div,
            {
              className: "text-center max-w-5xl w-full space-y-2",
              variants: containerVariants,
              initial: "hidden",
              animate: "visible",
            },
            /*#__PURE__*/ React.createElement(
              motion.h1,
              {
                className:
                  "font-heading font-black mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-8xl tracking-tight",
                variants: itemVariants,
                style: {
                  background:
                    "linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #ffd700 50%, #ff6b35 75%, #f7931e 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow:
                    "0 8px 32px rgba(255,107,53,0.4), 0 4px 16px rgba(247,147,30,0.3)",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))",
                },
              },
              "DASHBOARD",
            ),
            /*#__PURE__*/ React.createElement(
              motion.p,
              {
                initial: {
                  opacity: 0,
                  y: 15,
                },
                animate: {
                  opacity: 1,
                  y: 0,
                },
                transition: {
                  duration: 0.4,
                  delay: 0.1,
                  ease: "easeOut",
                },
                className:
                  "text-xl sm:text-2xl md:text-3xl font-bold max-w-4xl mx-auto font-body leading-relaxed uppercase tracking-wider",
                style: {
                  color: "#f1f5f9",
                  textShadow:
                    "0 4px 12px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.6)",
                  letterSpacing: "0.1em",
                },
              },
              "DOMINATE YOUR FITNESS JOURNEY",
            ),
            /*#__PURE__*/ React.createElement(
              motion.div,
              {
                initial: {
                  opacity: 0,
                  scale: 0.8,
                },
                animate: {
                  opacity: 1,
                  scale: 1,
                },
                transition: {
                  duration: 0.4,
                  delay: 0.2,
                  ease: "easeOut",
                },
                className: "mt-4 sm:mt-6 inline-block",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 rounded-md sm:rounded-lg md:rounded-xl backdrop-blur-md border border-orange-500/20 shadow-lg",
                  style: {
                    background:
                      "linear-gradient(135deg, rgba(255,107,53,0.12) 0%, rgba(247,147,30,0.06) 100%)",
                    boxShadow:
                      "0 2px 12px rgba(255,107,53,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
                  },
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className:
                      "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse shadow-md flex-shrink-0",
                    style: {
                      background:
                        "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
                      boxShadow: "0 0 8px rgba(255,107,53, 0.6)",
                    },
                  }),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "font-body text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold tracking-wide uppercase text-center leading-none",
                      style: {
                        color: "#f8fafc",
                        textShadow: "0 1px 3px rgba(0,0,0,0.7)",
                      },
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "hidden lg:inline",
                      },
                      /*#__PURE__*/ React.createElement(Star, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " REAL-TIME BEAST TRACKING ACTIVE",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "hidden md:inline lg:hidden",
                      },
                      /*#__PURE__*/ React.createElement(Star, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " BEAST TRACKING",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "hidden sm:inline md:hidden",
                      },
                      /*#__PURE__*/ React.createElement(Star, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " TRACKING",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "sm:hidden",
                      },
                      /*#__PURE__*/ React.createElement(Star, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " LIVE",
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute top-1/4 left-8 w-1 h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-full hidden lg:block",
    }),
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute top-1/3 right-12 w-1 h-12 bg-gradient-to-b from-transparent via-blue-300/30 to-transparent rounded-full hidden lg:block",
    }),
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute bottom-1/4 left-16 w-2 h-2 bg-white/30 rounded-full hidden lg:block animate-pulse",
    }),
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute bottom-1/3 right-8 w-1.5 h-1.5 bg-blue-200/40 rounded-full hidden lg:block animate-pulse",
      style: {
        animationDelay: "1s",
      },
    }),
    /*#__PURE__*/ React.createElement("div", {
      className: "absolute bottom-0 left-0 right-0 h-12",
      style: {
        background:
          "linear-gradient(to top, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.8) 40%, transparent 100%)",
      },
    }),
  );
};
export default DashboardHero;
