import { User, Settings, Phone, MessageCircle, HelpCircle, Lock, FileText, Star } from 'lucide-react';
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";


export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };
  const footerLinks = {
    account: [
      {
        name: "Profile",
        path: "/profile",
        icon: /*#__PURE__*/ React.createElement(User, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        name: "Settings",
        path: "/settings",
        icon: /*#__PURE__*/ React.createElement(Settings, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
    ],
    resources: [
      {
        name: "Contact",
        path: "/contact",
        icon: /*#__PURE__*/ React.createElement(Phone, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        name: "Forum",
        path: "/forum",
        icon: /*#__PURE__*/ React.createElement(MessageCircle, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        name: "Help Center",
        path: "#",
        icon: /*#__PURE__*/ React.createElement(HelpCircle, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
    ],
    legal: [
      {
        name: "Privacy Policy",
        path: "#",
        icon: /*#__PURE__*/ React.createElement(Lock, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        name: "Terms of Service",
        path: "#",
        icon: /*#__PURE__*/ React.createElement(FileText, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
    ],
  };
  const handleLinkClick = (path) => {
    if (path !== "#") {
      navigate(path);
    }
  };
  return /*#__PURE__*/ React.createElement(
    "footer",
    {
      className:
        "relative mt-12 sm:mt-16 bg-zinc-950 border-t border-zinc-800/80",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "relative",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "sm:col-span-2 lg:col-span-2",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center mb-3 sm:mb-4",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "relative",
                },
                /*#__PURE__*/ React.createElement("img", {
                  src: logo,
                  alt: "GymTracker",
                  className:
                    "h-8 sm:h-12 md:h-14 w-auto object-contain drop-shadow-lg",
                }),
                /*#__PURE__*/ React.createElement("div", {
                  className:
                    "absolute inset-0 rounded-full bg-gradient-to-br from-red-600 via-red-800 to-pink-500 opacity-20 blur-md",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "ml-3 sm:ml-6",
                },
                /*#__PURE__*/ React.createElement(
                  "h3",
                  {
                    className:
                      "text-sm sm:text-xl md:text-2xl font-heading text-white",
                  },
                  "GYMTRACKER",
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className:
                      "text-[10px] sm:text-sm text-neutral-400 font-body",
                  },
                  "Fitness Tracking App",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              {
                className:
                  "text-neutral-300 mb-3 sm:mb-4 md:mb-6 font-body text-[10px] sm:text-sm leading-relaxed",
              },
              "Professional fitness tracking for elite athletes worldwide. Transform your fitness journey with real-time analytics.",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "h4",
                {
                  className:
                    "text-[10px] sm:text-sm font-heading text-white mb-2 sm:mb-3",
                },
                "STAY UPDATED",
              ),
              /*#__PURE__*/ React.createElement(
                "form",
                {
                  onSubmit: handleNewsletterSubmit,
                  className: "flex flex-col sm:flex-row gap-1.5 sm:gap-2",
                },
                /*#__PURE__*/ React.createElement("input", {
                  type: "email",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  placeholder: "Enter your email",
                  className:
                    "flex-1 px-2.5 py-2 sm:px-3 sm:py-2.5 bg-neutral-900/60 border border-neutral-700/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 font-body text-[10px] sm:text-sm transition-all duration-300",
                  required: true,
                }),
                /*#__PURE__*/ React.createElement(
                  motion.button,
                  {
                    type: "submit",
                    whileHover: {
                      scale: 1.02,
                    },
                    whileTap: {
                      scale: 0.98,
                    },
                    className:
                      "px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-700 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-300 font-body text-[10px] sm:text-sm shadow-lg hover:shadow-red-600/25",
                  },
                  subscribed ? "✓ Subscribed" : "Join GRIND-X",
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "sm:col-span-2 lg:col-span-4 grid grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-6",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "h4",
                {
                  className:
                    "text-[10px] sm:text-sm font-heading text-white mb-2 sm:mb-3",
                },
                "ACCOUNT",
              ),
              /*#__PURE__*/ React.createElement(
                "ul",
                {
                  className: "space-y-1.5 sm:space-y-2",
                },
                footerLinks.account.map((link, index) =>
                  /*#__PURE__*/ React.createElement(
                    "li",
                    {
                      key: index,
                    },
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => handleLinkClick(link.path),
                        className:
                          "flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-neutral-400 hover:text-red-500 transition-all duration-300 font-body group w-full text-left",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            "group-hover:scale-110 transition-transform text-[10px] sm:text-xs",
                        },
                        link.icon,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            "group-hover:translate-x-1 transition-transform duration-300 truncate",
                        },
                        link.name,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "h4",
                {
                  className:
                    "text-[10px] sm:text-sm font-heading text-white mb-2 sm:mb-3",
                },
                "RESOURCES",
              ),
              /*#__PURE__*/ React.createElement(
                "ul",
                {
                  className: "space-y-1.5 sm:space-y-2",
                },
                footerLinks.resources.map((link, index) =>
                  /*#__PURE__*/ React.createElement(
                    "li",
                    {
                      key: index,
                    },
                    link.path !== "#"
                      ? /*#__PURE__*/ React.createElement(
                          Link,
                          {
                            to: link.path,
                            className:
                              "flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-neutral-400 hover:text-red-500 transition-all duration-300 font-body group",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "group-hover:scale-110 transition-transform text-[10px] sm:text-xs",
                            },
                            link.icon,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "group-hover:translate-x-1 transition-transform duration-300 truncate",
                            },
                            link.name,
                          ),
                        )
                      : /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => handleLinkClick(link.path),
                            className:
                              "flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-neutral-400 hover:text-red-500 transition-all duration-300 font-body group w-full text-left",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "group-hover:scale-110 transition-transform text-[10px] sm:text-xs",
                            },
                            link.icon,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "group-hover:translate-x-1 transition-transform duration-300 truncate",
                            },
                            link.name,
                          ),
                        ),
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "h4",
                {
                  className:
                    "text-[10px] sm:text-sm font-heading text-white mb-2 sm:mb-3",
                },
                "LEGAL",
              ),
              /*#__PURE__*/ React.createElement(
                "ul",
                {
                  className: "space-y-1.5 sm:space-y-2",
                },
                footerLinks.legal.map((link, index) =>
                  /*#__PURE__*/ React.createElement(
                    "li",
                    {
                      key: index,
                    },
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => handleLinkClick(link.path),
                        className:
                          "flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-neutral-400 hover:text-red-500 transition-all duration-300 font-body group w-full text-left",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            "group-hover:scale-110 transition-transform text-[10px] sm:text-xs",
                        },
                        link.icon,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            "group-hover:translate-x-1 transition-transform duration-300 truncate",
                        },
                        link.name,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "border-t border-neutral-800/50 bg-black/80 backdrop-blur-sm",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-center sm:text-left",
              },
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className: "text-[9px] sm:text-xs text-neutral-400 font-body",
                },
                /*#__PURE__*/ React.createElement(Star, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " 2026 GRIND-X.",
              ),
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className:
                    "text-[9px] sm:text-xs text-neutral-500 font-body mt-0.5 sm:mt-1",
                },
                "Empowering fitness transformations globally",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center justify-center sm:justify-end gap-2 sm:gap-4",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-1.5 sm:gap-2",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-[9px] sm:text-xs text-neutral-500 font-body",
                  },
                  "v2.1.0",
                ),
                /*#__PURE__*/ React.createElement("div", {
                  className:
                    "w-0.5 h-3 sm:w-1 sm:h-4 bg-neutral-700 rounded-full",
                }),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-1",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className:
                      "w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full animate-pulse",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-[9px] sm:text-xs text-red-500 font-body font-medium",
                    },
                    "System Online",
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
