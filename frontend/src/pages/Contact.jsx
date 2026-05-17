import { Circle, XCircle, Dumbbell, Salad, Scale, BicepsFlexed, Activity, Bandage, Settings, MessageCircle, Rocket, Mail, Trophy } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";


export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveSupport, setLiveSupport] = useState(true);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate live support status
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSupport((prev) => Math.random() > 0.1); // 90% uptime
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: "5d71368d-2672-4f5c-91e1-dbb7cc66c8b3",
          ...formData,
        }),
      });
      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black py-4 xs:py-6 sm:py-8",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "max-w-6xl mx-auto px-2 xs:px-3 sm:px-4",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-center mb-6 xs:mb-8 sm:mb-12",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "flex items-center justify-center gap-1.5 xs:gap-2 mb-2 xs:mb-3 sm:mb-4",
          },
          /*#__PURE__*/ React.createElement("div", {
            className: `w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full ${liveSupport ? "bg-red-500 animate-pulse shadow-lg shadow-red-500/50" : "bg-red-400"}`,
          }),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className:
                "text-[10px] xs:text-xs sm:text-sm font-medium text-white font-body tracking-wide",
            },
            liveSupport ? "🔴 LIVE SUPPORT ACTIVE" : "❌ SUPPORT OFFLINE",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "h1",
          {
            className:
              "text-xl xs:text-2xl sm:text-3xl md:text-4xl font-heading text-white mb-2 xs:mb-3 sm:mb-4 px-2 leading-tight",
          },
          "GRIND-X FITNESS CONSULTATION",
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className:
              "text-xs xs:text-sm sm:text-base text-neutral-400 font-body max-w-2xl mx-auto px-3 xs:px-4 leading-relaxed",
          },
          "Get personalized workout plans, nutrition guidance, and expert fitness advice from certified trainers. Real-time support for elite athletes.",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "mt-2 xs:mt-3 sm:mt-4 text-[10px] xs:text-xs text-neutral-500 font-body",
          },
          "Current Time: ",
          currentTime.toLocaleString(),
          " \u2022 Response within 2-4 hours",
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 sm:gap-8",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "card",
          },
          /*#__PURE__*/ React.createElement(
            "h2",
            {
              className:
                "text-base xs:text-lg sm:text-xl font-heading text-white mb-3 xs:mb-4 sm:mb-6 tracking-wide",
            },
            "SEND US A MESSAGE",
          ),
          submitted &&
            /*#__PURE__*/ React.createElement(
              motion.div,
              {
                initial: {
                  opacity: 0,
                  y: -10,
                },
                animate: {
                  opacity: 1,
                  y: 0,
                },
                className:
                  "mb-3 xs:mb-4 sm:mb-6 p-2.5 xs:p-3 sm:p-4 bg-green-600/20 border border-red-600/30 rounded-xl text-red-500 shadow-lg shadow-red-600/10",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-2 xs:gap-3",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "w-7 h-7 xs:w-8 xs:h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-white text-xs xs:text-sm",
                    },
                    "\u2713",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "min-w-0 flex-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "font-semibold text-xs xs:text-sm sm:text-base",
                    },
                    "Message Sent Successfully!",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-[10px] xs:text-xs sm:text-sm text-green-300",
                    },
                    "Our fitness experts will respond within 2-4 hours with personalized advice.",
                  ),
                ),
              ),
            ),
          /*#__PURE__*/ React.createElement(
            "form",
            {
              onSubmit: handleSubmit,
              className: "space-y-3 xs:space-y-4",
            },
            /*#__PURE__*/ React.createElement("input", {
              type: "hidden",
              name: "access_key",
              value: "5d71368d-2672-4f5c-91e1-dbb7cc66c8b3",
            }),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                null,
                /*#__PURE__*/ React.createElement(
                  "label",
                  {
                    className:
                      "block text-xs xs:text-sm font-medium text-neutral-300 mb-1.5 xs:mb-2 font-body",
                  },
                  "Full Name *",
                ),
                /*#__PURE__*/ React.createElement("input", {
                  type: "text",
                  name: "name",
                  value: formData.name,
                  onChange: handleChange,
                  required: true,
                  className:
                    "w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 font-body text-xs xs:text-sm transition-all",
                  placeholder: "Enter your full name",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                null,
                /*#__PURE__*/ React.createElement(
                  "label",
                  {
                    className:
                      "block text-xs xs:text-sm font-medium text-neutral-300 mb-1.5 xs:mb-2 font-body",
                  },
                  "Email Address *",
                ),
                /*#__PURE__*/ React.createElement("input", {
                  type: "email",
                  name: "email",
                  value: formData.email,
                  onChange: handleChange,
                  required: true,
                  className:
                    "w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 font-body text-xs xs:text-sm transition-all",
                  placeholder: "your.email@example.com",
                }),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "label",
                {
                  className:
                    "block text-xs xs:text-sm font-medium text-neutral-300 mb-1.5 xs:mb-2 font-body",
                },
                "Subject *",
              ),
              /*#__PURE__*/ React.createElement(
                "select",
                {
                  name: "subject",
                  value: formData.subject,
                  onChange: handleChange,
                  required: true,
                  className:
                    "w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 font-body text-xs xs:text-sm transition-all",
                },
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "",
                  },
                  "Select a topic",
                ),
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "Personal Training",
                  },
                  /*#__PURE__*/ React.createElement(Dumbbell, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Personal Training & Workout Plans",
                ),
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "Nutrition Coaching",
                  },
                  /*#__PURE__*/ React.createElement(Salad, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Nutrition Coaching & Diet Plans",
                ),
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "Weight Loss",
                  },
                  /*#__PURE__*/ React.createElement(Scale, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Weight Loss & Body Transformation",
                ),
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "Muscle Building",
                  },
                  /*#__PURE__*/ React.createElement(BicepsFlexed, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Muscle Building & Strength Training",
                ),
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "Sports Performance",
                  },
                  /*#__PURE__*/ React.createElement(Activity, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Sports Performance & Athletic Training",
                ),
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "Injury Recovery",
                  },
                  /*#__PURE__*/ React.createElement(Bandage, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Injury Recovery & Rehabilitation",
                ),
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "Technical Support",
                  },
                  /*#__PURE__*/ React.createElement(Settings, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Technical Support",
                ),
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "General Inquiry",
                  },
                  /*#__PURE__*/ React.createElement(MessageCircle, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " General Fitness Inquiry",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "label",
                {
                  className:
                    "block text-xs xs:text-sm font-medium text-neutral-300 mb-1.5 xs:mb-2 font-body",
                },
                "Message *",
              ),
              /*#__PURE__*/ React.createElement("textarea", {
                name: "message",
                value: formData.message,
                onChange: handleChange,
                required: true,
                rows:
                  window.innerWidth < 475 ? 4 : window.innerWidth < 640 ? 5 : 6,
                className:
                  "w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 font-body resize-none text-xs xs:text-sm transition-all",
                placeholder:
                  "Describe your fitness goals, current challenges, training experience, dietary preferences, or any specific questions about workouts, nutrition, or achieving your dream physique...",
              }),
            ),
            /*#__PURE__*/ React.createElement(
              motion.button,
              {
                type: "submit",
                disabled: isSubmitting,
                whileHover: {
                  scale: 1.02,
                },
                whileTap: {
                  scale: 0.98,
                },
                className:
                  "w-full px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 bg-gradient-to-r from-red-700 to-red-700 hover:from-red-600 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-red-600/25 font-body text-xs xs:text-sm sm:text-base active:scale-95",
              },
              isSubmitting
                ? /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-center justify-center gap-2",
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      className:
                        "animate-spin w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "text-xs xs:text-sm sm:text-base",
                      },
                      "Sending Message...",
                    ),
                  )
                : "🚀 Send Message",
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-3 xs:space-y-4 sm:space-y-6",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "card",
            },
            /*#__PURE__*/ React.createElement(
              "h3",
              {
                className:
                  "text-base xs:text-lg font-heading text-white mb-2 xs:mb-3 sm:mb-4 tracking-wide",
              },
              "DIRECT CONSULTATION",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3 sm:mb-4",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-xl xs:text-2xl",
                  },
                  /*#__PURE__*/ React.createElement(Mail, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "min-w-0 flex-1",
                },
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className:
                      "text-neutral-300 font-body text-xs xs:text-sm mb-0.5 xs:mb-1",
                  },
                  "Certified Fitness Expert",
                ),
                /*#__PURE__*/ React.createElement(
                  "a",
                  {
                    href: "mailto:aravindrajaa03@gmail.com?subject=GymTracker Fitness Consultation&body=Hi! I need help with my fitness journey. Here are my details:%0D%0A%0D%0AName: %0D%0AAge: %0D%0ACurrent Fitness Level: %0D%0AGoals: %0D%0AQuestions: ",
                    className:
                      "text-red-500 font-medium hover:text-red-400 transition-colors duration-300 font-body text-xs xs:text-sm break-all",
                  },
                  "aravindrajaa03@gmail.com",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "bg-neutral-900/40 rounded-lg p-2 xs:p-2.5 sm:p-3 mb-2 xs:mb-3",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center gap-1.5 xs:gap-2 mb-1 xs:mb-1.5 sm:mb-2",
                },
                /*#__PURE__*/ React.createElement("div", {
                  className:
                    "w-1.5 h-1.5 xs:w-2 xs:h-2 bg-red-500 rounded-full animate-pulse",
                }),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-[10px] xs:text-xs text-red-500 font-body font-semibold tracking-wide",
                  },
                  "EXPERT AVAILABLE",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className:
                    "text-neutral-400 text-[10px] xs:text-xs font-body",
                },
                "Certified Personal Trainer \u2022 Nutrition Specialist \u2022 5+ Years Experience",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              {
                className:
                  "text-neutral-400 text-xs xs:text-sm font-body leading-relaxed",
              },
              "Get personalized workout plans, nutrition guidance, and expert advice for your fitness transformation.",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "card",
            },
            /*#__PURE__*/ React.createElement(
              "h3",
              {
                className:
                  "text-base xs:text-lg font-heading text-white mb-2 xs:mb-3 sm:mb-4 tracking-wide",
              },
              "LIVE SUPPORT STATUS",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-2 xs:space-y-3",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center justify-between p-2 xs:p-2.5 sm:p-3 bg-neutral-900/40 rounded-lg",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex items-center gap-2 xs:gap-3 min-w-0 flex-1",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className:
                      "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-neutral-300 font-body text-[10px] xs:text-xs sm:text-sm truncate",
                    },
                    "Fitness Consultation",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-red-500 text-[10px] xs:text-xs font-body font-semibold flex-shrink-0 ml-2",
                  },
                  "2-4 HRS",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center justify-between p-2 xs:p-2.5 sm:p-3 bg-neutral-900/40 rounded-lg",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex items-center gap-2 xs:gap-3 min-w-0 flex-1",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className:
                      "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-neutral-300 font-body text-[10px] xs:text-xs sm:text-sm truncate",
                    },
                    "Custom Workout Plans",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-red-500 text-[10px] xs:text-xs font-body font-semibold flex-shrink-0 ml-2",
                  },
                  "4-8 HRS",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center justify-between p-2 xs:p-2.5 sm:p-3 bg-neutral-900/40 rounded-lg",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex items-center gap-2 xs:gap-3 min-w-0 flex-1",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className:
                      "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 bg-red-600 rounded-full animate-pulse flex-shrink-0",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-neutral-300 font-body text-[10px] xs:text-xs sm:text-sm truncate",
                    },
                    "Technical Support",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-red-600 text-[10px] xs:text-xs font-body font-semibold flex-shrink-0 ml-2",
                  },
                  "24 HRS",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "mt-2 xs:mt-3 text-center",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-[10px] xs:text-xs text-neutral-500 font-body",
                },
                "Last Response: ",
                Math.floor(Math.random() * 30 + 10),
                " minutes ago",
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "card",
            },
            /*#__PURE__*/ React.createElement(
              "h3",
              {
                className:
                  "text-base xs:text-lg font-heading text-white mb-2 xs:mb-3 sm:mb-4 tracking-wide",
              },
              "EXPERT CREDENTIALS",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-2 xs:space-y-3",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center gap-2 xs:gap-3 p-2 xs:p-2.5 sm:p-3 bg-neutral-900/40 rounded-lg",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-xl xs:text-2xl flex-shrink-0",
                  },
                  /*#__PURE__*/ React.createElement(Trophy, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "min-w-0 flex-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-xs xs:text-sm font-semibold text-white font-body",
                    },
                    "Certified Personal Trainer",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-[10px] xs:text-xs text-neutral-400 font-body",
                    },
                    "NASM, ACSM Certified",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center gap-2 xs:gap-3 p-2 xs:p-2.5 sm:p-3 bg-neutral-900/40 rounded-lg",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-xl xs:text-2xl flex-shrink-0",
                  },
                  /*#__PURE__*/ React.createElement(Salad, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "min-w-0 flex-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-xs xs:text-sm font-semibold text-white font-body",
                    },
                    "Nutrition Specialist",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-[10px] xs:text-xs text-neutral-400 font-body",
                    },
                    "Sports Nutrition Certified",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center gap-2 xs:gap-3 p-2 xs:p-2.5 sm:p-3 bg-neutral-900/40 rounded-lg",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-xl xs:text-2xl flex-shrink-0",
                  },
                  /*#__PURE__*/ React.createElement(BicepsFlexed, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "min-w-0 flex-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-xs xs:text-sm font-semibold text-white font-body",
                    },
                    "5+ Years Experience",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-[10px] xs:text-xs text-neutral-400 font-body",
                    },
                    "500+ Successful Transformations",
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "mt-3 xs:mt-4 text-center p-2 xs:p-2.5 sm:p-3 bg-gradient-to-r from-green-600/20 to-red-700/20 rounded-lg border border-red-600/30 shadow-lg",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs xs:text-sm font-semibold text-red-500 font-body",
                },
                "\u2713 Verified Expert",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-[10px] xs:text-xs text-neutral-300 font-body",
                },
                "Trusted by 1000+ Athletes",
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
