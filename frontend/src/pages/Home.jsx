// Home.jsx - Ultra Performance Optimized
import { Dumbbell, BarChart3, Target, Salad, BicepsFlexed, Globe, Star, Lock, Timer, Circle, AlertTriangle, Lightbulb, Zap, ArrowUpRight, Activity, Flame } from 'lucide-react';
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { forceStatsRefresh } from "../utils/forceStatsRefresh";
import Hero from "../components/Hero";
import LoadingScreen from "../components/LoadingScreen";
import BodyFatCard from "../components/BodyFatCard";
import StreakWidget from "../components/StreakWidget";

// Lazy load images
import Home1 from "../assets/Home1.jpg";
import Home2 from "../assets/Home2.jpg";
import Home3 from "../assets/Home3.jpg";
import Home4 from "../assets/Home4.jpg";
import Home5 from "../assets/Home5.jpg";
import NutritionHome from "../assets/NutritionHome.jpg";

// Body Fat Percentage Images
import BF45 from "../assets/BD-Fat-45.png";
import BF40 from "../assets/BD-Fat-40.png";
import BF30 from "../assets/BD-Fat-30.png";
import BF20 from "../assets/BD-Fat-20.png";
import BF15 from "../assets/BD-Fat-15.png";
import BF12 from "../assets/BD-Fat-12.png";
import BF10 from "../assets/BD-Fat-10.png";
import BF8 from "../assets/BD-Fat-8.png";
import BF5 from "../assets/BD-Fat-5.png";

// Recovery Images
import ActiveRecovery from "../assets/ACTIVE-RECOVERY.jpg";
import StretchingProtocol from "../assets/STRETCHING-PROTOCOL.jpg";
import RecoveryNutrition from "../assets/RECOVERY-NUTRITION.jpg";
import Dominance from "../assets/Dominance.jpg";
import Again from "../assets/Again.png";


// Parallax Section Component
const ParallaxSection = ({
  id,
  imageSrc,
  imageAlt,
  accentColorClass,
  // e.g., 'lime-500', 'red-600'
  accentText,
  badgeText,
  titleTop,
  titleBottom,
  descriptionPrefix,
  descriptionHighlight,
  descriptionSuffix,
  imageBadges,
  // array of { title, value, titleClass, valueClass, borderClass }
  isReversed,
  onClick,
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Mathematically perfect parallax:
  // Container is 100%. Image is 125% and shifted up by -12.5%.
  // Moving y by [-10%, 10%] translates it by exactly +/-12.5% of the container height.
  // This results in strong parallax movement with absolutely ZERO gaps at the top or bottom!
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // Foreground text moves slightly faster in the opposite direction for 3D depth
  const textY = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  return /*#__PURE__*/ React.createElement(
    "section",
    {
      id: id,
      ref: ref,
      className: "mb-6 sm:mb-20 overflow-hidden",
    },
    /*#__PURE__*/ React.createElement(
      motion.div,
      {
        style: {
          opacity,
        },
        className: "relative group cursor-pointer",
        onClick: onClick,
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: `relative overflow-hidden bg-zinc-900 border border-${accentColorClass} sm:border-4 shadow-2xl transition-all duration-300 hover:border-white`,
          style: {
            contain: "layout style paint",
          },
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "grid lg:grid-cols-2 gap-0",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: `relative h-[220px] sm:h-[400px] lg:h-[600px] overflow-hidden ${isReversed ? "order-1 lg:order-2" : ""}`,
            },
            /*#__PURE__*/ React.createElement(
              motion.div,
              {
                style: {
                  y: backgroundY,
                  height: "125%",
                  top: "-12.5%",
                },
                className: "absolute inset-0 w-full",
              },
              /*#__PURE__*/ React.createElement("img", {
                src: imageSrc,
                alt: imageAlt,
                loading: "lazy",
                decoding: "async",
                style: {
                  contentVisibility: "auto",
                },
                className:
                  "w-full h-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105",
              }),
            ),
            /*#__PURE__*/ React.createElement("div", {
              className: "absolute inset-0 bg-black/20 pointer-events-none",
            }),
            imageBadges &&
              imageBadges.length > 0 &&
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-8 sm:left-8 sm:right-8",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-1 sm:gap-4",
                  },
                  imageBadges.map((badge, idx) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        key: idx,
                        className: `bg-black/90 border ${badge.borderClass} px-1.5 py-1 sm:px-6 sm:py-3 flex-1`,
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: `${badge.titleClass} text-[7px] sm:text-xs font-black tracking-wide uppercase leading-none`,
                        },
                        badge.title,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: `${badge.valueClass} text-[10px] sm:text-2xl font-black leading-tight mt-0.5`,
                        },
                        badge.value,
                      ),
                    ),
                  ),
                ),
              ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: `p-3 sm:p-8 lg:p-16 flex flex-col justify-center relative bg-black ${isReversed ? "order-2 lg:order-1" : ""}`,
            },
            /*#__PURE__*/ React.createElement(
              motion.div,
              {
                style: {
                  y: textY,
                },
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "mb-3 sm:mb-8",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex items-center gap-1.5 sm:gap-4 mb-2 sm:mb-6",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className: `w-0.5 sm:w-2 h-6 sm:h-16 bg-${accentColorClass}`,
                  }),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: `text-[9px] sm:text-sm font-black text-${accentColorClass} tracking-wider uppercase`,
                    },
                    accentText,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: `inline-flex items-center gap-1 sm:gap-3 px-2 py-1 sm:px-6 sm:py-3 text-[8px] sm:text-sm font-black text-${accentColorClass} bg-zinc-900 border sm:border-2 border-${accentColorClass} uppercase tracking-wide`,
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className: `w-1 h-1 sm:w-2 sm:h-2 bg-${accentColorClass}`,
                  }),
                  badgeText,
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "h3",
                {
                  className:
                    "relative text-lg sm:text-4xl lg:text-6xl font-black mb-2 sm:mb-8 leading-[0.85] uppercase",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-white",
                  },
                  titleTop,
                ),
                /*#__PURE__*/ React.createElement("br", null),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: `text-${accentColorClass}`,
                  },
                  titleBottom,
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className:
                    "relative text-zinc-400 text-[11px] sm:text-lg lg:text-xl leading-snug sm:leading-relaxed font-medium",
                },
                descriptionPrefix,
                " ",
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: `text-${accentColorClass} font-black`,
                  },
                  descriptionHighlight,
                ),
                descriptionSuffix,
              ),
            ),
          ),
        ),
      ),
    ),
  );
};
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { stats, isOnline } = useRealTime();

  // Optimized state management
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [recoveryQuoteIndex, setRecoveryQuoteIndex] = useState(0);
  const observerRef = useRef(null);
  const mountedRef = useRef(true);
  const timersRef = useRef({});

  // ─────────────────────────────────────────────────────────────────────────
  // SCROLL PINNING — horizontal gallery driven by vertical scroll
  // ─────────────────────────────────────────────────────────────────────────
  const scrollContainerRef = useRef(null); // outer sticky section
  const flexContainerRef   = useRef(null); // inner motion.div (all cards)
  // A ref (not state) so the Framer Motion closure always reads the LIVE value.
  // React state is captured at MotionValue creation time (= 0) and stale forever.
  const scrollAmountRef = useRef(0);

  // Direct-DOM height updater — bypasses React render cycle so useScroll
  // never sees a stale/short section height.
  const applyHeight = useCallback((px) => {
    const section = scrollContainerRef.current;
    if (section) section.style.height = px + "px";
  }, []);

  useEffect(() => {
    const measure = () => {
      const flex    = flexContainerRef.current;
      const section = scrollContainerRef.current;
      if (!flex || !section) return;

      const amount = Math.max(0, flex.scrollWidth - window.innerWidth);
      scrollAmountRef.current = amount;

      // height = viewportH + scrollAmount × 1.2 (20 % spring-settle buffer)
      applyHeight(window.innerHeight + amount * 1.2);
    };

    let resizeObs = null;

    const attach = () => {
      const flex = flexContainerRef.current;
      if (!flex) return;

      resizeObs = new ResizeObserver(() => requestAnimationFrame(measure));
      resizeObs.observe(flex);
      window.addEventListener("resize", measure);

      // Also re-measure when any image inside the gallery finishes loading
      flex.querySelectorAll("img").forEach((img) => {
        if (!img.complete) img.addEventListener("load", measure, { once: true });
      });

      measure();
    };

    if (flexContainerRef.current) {
      attach();
    } else {
      // Body-fat section may not be in DOM yet on first paint — wait one frame
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(attach); // double-RAF ensures layout is settled
      });
      return () => cancelAnimationFrame(raf);
    }

    return () => {
      resizeObs?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isLoading, applyHeight]);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  // Always reads scrollAmountRef.current at tick time — zero stale-closure risk
  const xTransform = useTransform(
    scrollYProgress,
    (latest) => -latest * scrollAmountRef.current
  );
  const springX = useSpring(xTransform, { stiffness: 80, damping: 20, mass: 0.5 });

  // Memoized auth check
  const isAuthenticated = useCallback(() => {
    try {
      return auth?.isAuthenticated?.() || false;
    } catch {
      return false;
    }
  }, [auth]);

  // Optimized features list
  const features = useMemo(
    () => [
      {
        id: "workout",
        icon: /*#__PURE__*/ React.createElement(Dumbbell, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        title: "WORKOUT DOMINATION",
        desc: "AI-powered training with real-time form analysis",
        color: "blue",
      },
      {
        id: "analytics",
        icon: /*#__PURE__*/ React.createElement(BarChart3, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        title: "PROGRESS ANALYTICS",
        desc: "Advanced metrics with predictive insights",
        color: "purple",
      },
      {
        id: "goals",
        icon: /*#__PURE__*/ React.createElement(Target, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        title: "GOAL CRUSHING",
        desc: "Smart goal setting with achievement tracking",
        color: "green",
      },
      {
        id: "nutrition",
        icon: /*#__PURE__*/ React.createElement(Salad, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        title: "NUTRITION TRACKING",
        desc: "Track meals, calories, and macros",
        color: "green",
      },
    ],
    [],
  );
  const totalWorkouts = useMemo(() => {
    if (!isAuthenticated() || !auth?.user) {
      return 0;
    }
    const count = stats?.totalWorkouts ?? 0;
    return count > 0 ? count : 0;
  }, [stats?.totalWorkouts, refreshTrigger, isAuthenticated, auth?.user]);
  const todayWorkouts = useMemo(() => {
    if (!isAuthenticated() || !auth?.user) {
      return 0;
    }
    const count = stats?.todayWorkouts ?? 0;
    return count > 0 ? count : 0;
  }, [stats?.todayWorkouts, refreshTrigger, isAuthenticated, auth?.user]);

  // Optimized quick stats - USER SPECIFIC
  const quickStats = useMemo(() => {
    if (!isAuthenticated() || !auth?.user) {
      return [
        {
          label: "Total Workouts",
          value: 0,
          icon: /*#__PURE__*/ React.createElement(BicepsFlexed, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          color: "blue",
          path: "/login",
          subtitle: "Login to track your workouts",
        },
      ];
    }
    return [
      {
        label: "Total Workouts",
        value: totalWorkouts,
        icon: /*#__PURE__*/ React.createElement(BicepsFlexed, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        color: "blue",
        path: "/workouts",
        subtitle:
          totalWorkouts > 0
            ? `${totalWorkouts} completed!`
            : "No workouts yet - Start your journey!",
      },
    ];
  }, [totalWorkouts, isAuthenticated, auth?.user]);
  const globalStats = useMemo(
    () => [
      {
        value: "15K+",
        label: "ELITE ATHLETES",
        sublabel: "WORLDWIDE",
        color: "blue",
        icon: /*#__PURE__*/ React.createElement(Globe, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        value: "125K+",
        label: "WORKOUTS",
        sublabel: "COMPLETED",
        color: "purple",
        icon: /*#__PURE__*/ React.createElement(BicepsFlexed, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        value: "85K+",
        label: "GOALS",
        sublabel: "ACHIEVED",
        color: "green",
        icon: /*#__PURE__*/ React.createElement(Target, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        value: "4.9★",
        label: "APP RATING",
        sublabel: "EXCELLENCE",
        color: "yellow",
        icon: /*#__PURE__*/ React.createElement(Star, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
    ],
    [],
  );
  const recoveryQuotes = useMemo(
    () => [
      "Rest is not laziness. It's preparation for greatness.",
      "Muscles are torn in the gym, fed in the kitchen, built in bed.",
      "Recovery is where champions are made.",
      "Your body repairs and grows during rest, not during training.",
      "Rest days are progress days.",
    ],
    [],
  );
  const showRestDay = true; // Always show Rest Day & Recovery sections to everyone as requested

  // Optimized timer management
  useEffect(() => {
    mountedRef.current = true;
    timersRef.current.time = setInterval(() => {
      if (mountedRef.current) {
        setCurrentTime(new Date());
      }
    }, 5000);
    return () => {
      mountedRef.current = false;
      Object.values(timersRef.current).forEach((timer) => clearInterval(timer));
    };
  }, []);

  // Ultra-optimized intersection observer with passive listeners
  useEffect(() => {
    const observerOptions = {
      threshold: 0.05,
      rootMargin: "100px 0px",
    };
    observerRef.current = new IntersectionObserver((entries) => {
      requestAnimationFrame(() => {
        const updates = {};
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-id") || entry.target.id;
          if (id) {
            updates[id] = entry.isIntersecting;
          }
        });
        if (Object.keys(updates).length > 0) {
          setIsVisible((prev) => ({
            ...prev,
            ...updates,
          }));
        }
      });
    }, observerOptions);
    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll("[data-animate]");
      elements.forEach((el) => observerRef.current?.observe(el));
    }, 50);
    return () => {
      clearTimeout(timeoutId);
      observerRef.current?.disconnect();
    };
  }, []);

  // Optimized feature rotation
  useEffect(() => {
    timersRef.current.features = setInterval(() => {
      if (mountedRef.current) {
        setActiveFeature((prev) => (prev + 1) % features.length);
      }
    }, 5000);
    timersRef.current.quotes = setInterval(() => {
      if (mountedRef.current) {
        setRecoveryQuoteIndex((prev) => (prev + 1) % recoveryQuotes.length);
      }
    }, 5000);
    return () => {
      if (timersRef.current.features) clearInterval(timersRef.current.features);
      if (timersRef.current.quotes) clearInterval(timersRef.current.quotes);
    };
  }, [features.length, recoveryQuotes.length]);

  // Optimized event listeners
  useEffect(() => {
    const handleWorkoutComplete = (e) => {
      const detail = e?.detail;
      if (!detail || !mountedRef.current) return;
      const msg = detail.savedOffline
        ? `🎉 ${detail.exercise} completed! (Saved offline)`
        : `🎉 ${detail.exercise} completed!`;
      setNotification({
        type: "workout",
        message: msg,
      });
      setRefreshTrigger((prev) => prev + 1);
      setTimeout(() => mountedRef.current && setNotification(null), 3000);
    };
    const handleStatsUpdate = () => {
      if (mountedRef.current) {
        setRefreshTrigger((prev) => prev + 1);
      }
    };
    const events = [
      ["workoutCompleted", handleWorkoutComplete],
      ["realTimeStatsUpdate", handleStatsUpdate],
      ["analyticsWorkoutUpdate", handleStatsUpdate],
    ];
    events.forEach(([event, handler]) => {
      window.addEventListener(event, handler);
    });
    return () => {
      events.forEach(([event, handler]) => {
        window.removeEventListener(event, handler);
      });
    };
  }, []);

  // Clean fake data on mount - USER SPECIFIC
  useEffect(() => {
    if (!isAuthenticated() || !auth?.user) {
      console.log("🔒 No authenticated user - skipping workout cleanup");
      return;
    }
    try {
      const currentUser = auth.user;
      const workouts = JSON.parse(
        localStorage.getItem("workoutSync_workouts") || "[]",
      );
      const realUserWorkouts = workouts.filter((workout) => {
        const isRealWorkout =
          workout.exercise &&
          workout.exercise !== "Workout" &&
          workout.exercise !== "Test Workout" &&
          (workout.duration > 0 || workout.caloriesBurned > 0) &&
          workout.completedAt &&
          !workout.id?.includes("test_") &&
          !workout.id?.includes("fake_") &&
          !workout.id?.includes("demo_");
        const belongsToUser =
          workout.userId === currentUser.id ||
          workout.userId === currentUser._id ||
          (!workout.userId && isRealWorkout);
        return isRealWorkout && belongsToUser;
      });
      if (realUserWorkouts.length !== workouts.length) {
        const otherUsersWorkouts = workouts.filter(
          (w) =>
            w.userId &&
            w.userId !== currentUser.id &&
            w.userId !== currentUser._id,
        );
        const allWorkouts = [...otherUsersWorkouts, ...realUserWorkouts];
        localStorage.setItem(
          "workoutSync_workouts",
          JSON.stringify(allWorkouts),
        );
        setRefreshTrigger((prev) => prev + 1);
        console.log(
          `🧹 Cleaned fake workouts for user ${currentUser.id}: ${workouts.length} → ${realUserWorkouts.length} user workouts`,
        );
      }
    } catch (error) {
      console.warn("Error cleaning fake workouts:", error);
    }
  }, [isAuthenticated, auth?.user]);

  // Handle location state
  useEffect(() => {
    const workoutState = location.state;
    if (workoutState?.workoutCompleted && mountedRef.current) {
      const message = workoutState.savedOffline
        ? `🎉 ${workoutState.exercise} completed! (Saved offline)`
        : `🎉 ${workoutState.exercise} completed!`;
      setNotification({
        message,
        type: "workout",
      });
      navigate(location.pathname, {
        replace: true,
      });
      setTimeout(() => mountedRef.current && setNotification(null), 3000);
    }
  }, [location.state, navigate, location.pathname]);

  // Loading completion handler
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Navigation helper
  const handleNav = useCallback((path) => navigate(path), [navigate]);

  // Optimized count-up hook
  function useCountUp(value, duration = 400) {
    const [display, setDisplay] = useState(value);
    const rafRef = useRef(null);
    useEffect(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const start = performance.now();
      const fromValue = Number(display) || 0;
      const toValue = Number(value) || 0;
      const delta = toValue - fromValue;
      if (delta === 0) return;
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 2);
        const next = Math.round(fromValue + delta * eased);
        setDisplay(next);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };
      rafRef.current = requestAnimationFrame(step);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [value, duration, display]);
    return display;
  }

  const totalWorkoutsCount = useCountUp(totalWorkouts, 400);
  const todayWorkoutsCount = useCountUp(todayWorkouts, 400);

  // Optimized Image Component with lazy loading
  const OptimizedImage = /*#__PURE__*/ React.memo(({ src, alt, className }) =>
    /*#__PURE__*/ React.createElement("img", {
      src: src,
      alt: alt,
      loading: "lazy",
      decoding: "async",
      className: className,
    }),
  );

  const FeatureCard = ({ feature, index }) => {
    const isActive = index === activeFeature;
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        onMouseEnter: () => setActiveFeature(index),
        onFocus: () => setActiveFeature(index),
        tabIndex: 0,
        role: "button",
        "aria-pressed": isActive,
        className: `relative group cursor-pointer transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-lime-500 ${isActive ? "translate-x-1" : "hover:translate-x-0.5"}`,
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: `relative bg-zinc-900 border-l-4 p-4 sm:p-6 lg:p-8 shadow-2xl transition-all duration-300 ${isActive ? "border-lime-500 bg-neutral-900" : "border-zinc-700 hover:border-zinc-600"}`,
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mb-4 sm:mb-6",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-black border-2 border-lime-500",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-2xl sm:text-3xl",
              },
              feature.icon,
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-2 sm:space-y-4",
          },
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: `font-black text-base sm:text-xl uppercase tracking-tight transition-all duration-300 ${isActive ? "text-lime-500" : "text-white group-hover:text-lime-500"}`,
            },
            feature.title,
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className:
                "text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium group-hover:text-zinc-300 transition-colors duration-300",
            },
            feature.desc,
          ),
        ),
        isActive &&
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "absolute top-3 right-3 sm:top-4 sm:right-4",
            },
            /*#__PURE__*/ React.createElement("div", {
              className: "w-2 h-2 sm:w-3 sm:h-3 bg-lime-500",
            }),
          ),
      ),
    );
  };
  const GlobalStat = ({ stat }) => {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "relative group transform transition-all duration-300 hover:translate-y-[-2px]",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "relative bg-zinc-900 border-2 border-neutral-900 p-4 sm:p-6 lg:p-8 text-center shadow-2xl group-hover:border-lime-500 transition-all duration-300",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mb-4 sm:mb-6",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-black border-2 border-lime-500",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-2xl sm:text-3xl",
              },
              stat.icon,
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "text-2xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 text-white transition-all duration-300 group-hover:text-lime-500",
          },
          stat.value,
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "text-white font-black text-xs sm:text-sm uppercase tracking-widest mb-1 sm:mb-2",
          },
          stat.label,
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "text-zinc-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider",
          },
          stat.sublabel,
        ),
      ),
    );
  };

  const renderHomeStatsSection = useMemo(() => (
      <section
        data-animate="true"
        data-id="quick-stats"
        className="mb-6 sm:mb-16 px-3 sm:px-6"
      >
        <div className="max-w-5xl mx-auto transition-all duration-500 opacity-100 translate-y-0">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8">
            <div className="inline-flex items-center justify-center mb-1.5 sm:mb-2.5">
              <div className="h-0.5 w-8 sm:h-1 sm:w-14 bg-gradient-to-r from-lime-500 to-emerald-400 rounded-full" />
            </div>
            <h2 className="text-lg sm:text-3xl md:text-4xl font-black mb-1 text-white uppercase tracking-tight">
              {isAuthenticated() && auth?.user ? "YOUR STATS" : "GET STARTED"}
            </h2>
            <p className="text-[11px] sm:text-sm text-zinc-400 max-w-md mx-auto font-medium leading-snug">
              {isAuthenticated() && auth?.user
                ? "Track your performance and training milestones in real-time"
                : "Sign in to activate real-time telemetry and track your fitness journey"}
            </p>
            {isAuthenticated() && auth?.user && (
              <div className="flex justify-center mt-3 sm:mt-4">
                <StreakWidget />
              </div>
            )}
          </div>

          {/* Modern Bento Container */}
          <div className="home-telemetry-bento bg-white dark:bg-[#0e0e11]/90 border border-gray-200 dark:border-zinc-800/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm dark:shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-stretch">
              
              {/* Left: Authentic High-Impact Gym Visual Card */}
              <div className="theme-dark-surface lg:col-span-5 relative rounded-xl sm:rounded-2xl overflow-hidden h-32 sm:h-44 lg:h-auto min-h-[130px] sm:min-h-[180px] lg:min-h-[260px] flex flex-col justify-between p-3 sm:p-5 group border border-zinc-700/50 dark:border-zinc-800/60 shadow-inner">
                <img
                  src={Home4}
                  alt="Elite Gym Training"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
                
                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/70 backdrop-blur-md border border-lime-500/40 text-[9px] sm:text-[10px] font-black text-lime-400 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                    <span>LIVE TELEMETRY</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md border border-zinc-700/60 text-[9px] sm:text-[10px] font-bold text-zinc-300">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-lime-400" />
                    <span>GRIND-X</span>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10">
                  <div className="text-[9px] sm:text-[10px] font-black text-lime-400 uppercase tracking-widest mb-0.5">
                    ATHLETE ENGINE
                  </div>
                  <h3 className="text-sm sm:text-xl font-black text-white uppercase tracking-tight leading-tight">
                    REAL-TIME LOGGING
                  </h3>
                  <p className="hidden sm:block text-xs text-zinc-200 font-medium leading-snug line-clamp-1 mt-0.5">
                    Every rep, set, and session synced automatically to your profile.
                  </p>
                </div>
              </div>

              {/* Right: Modern Responsive Metrics Hub */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-2.5 sm:gap-3">
                
                {/* Top Row: 2-Column Responsive Metric Grid (Side-by-Side on all screen sizes) */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  
                  {/* Card 1: Total Workouts */}
                  <div 
                    onClick={() => navigate(isAuthenticated() && auth?.user ? "/dashboard" : "/login")}
                    className="cursor-pointer bg-gray-50/80 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-800/90 hover:border-emerald-500/60 dark:hover:border-lime-500/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 group hover:bg-white dark:hover:bg-zinc-900 shadow-sm dark:shadow-md flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-100/70 dark:bg-lime-500/10 border border-emerald-200 dark:border-lime-500/20 text-emerald-600 dark:text-lime-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BicepsFlexed className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                      </div>
                      <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider border ${
                        !isAuthenticated() || !auth?.user
                          ? "border-gray-200 bg-gray-100 text-gray-500 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400"
                          : isOnline && stats?.isRealTime
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-400"
                            : "border-gray-200 bg-gray-100 text-gray-500 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          !isAuthenticated() || !auth?.user ? "bg-gray-400 dark:bg-zinc-500" : "bg-emerald-500 dark:bg-lime-500 animate-pulse"
                        }`} />
                        {!isAuthenticated() || !auth?.user ? "LOCKED" : "LIVE"}
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-none mb-1 tracking-tight">
                        {!isAuthenticated() || !auth?.user ? "0" : totalWorkouts}
                      </div>
                      <div className="text-[9px] sm:text-xs font-black text-emerald-700 dark:text-lime-400 uppercase tracking-wider mb-0.5 truncate">
                        TOTAL WORKOUTS
                      </div>
                      <div className="text-[9px] sm:text-[11px] text-gray-500 dark:text-zinc-400 font-medium truncate">
                        {!isAuthenticated() || !auth?.user
                          ? "Sign in to track"
                          : totalWorkouts > 0
                            ? `${totalWorkouts} completed`
                            : "Ready for 1st"}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Today's Workouts */}
                  <div 
                    onClick={() => navigate(isAuthenticated() && auth?.user ? "/start-workout" : "/login")}
                    className="cursor-pointer bg-gray-50/80 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-800/90 hover:border-orange-500/60 dark:hover:border-orange-500/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 group hover:bg-white dark:hover:bg-zinc-900 shadow-sm dark:shadow-md flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-orange-100/70 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400">
                        TODAY
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-none mb-1 tracking-tight">
                        {!isAuthenticated() || !auth?.user ? "0" : todayWorkouts}
                      </div>
                      <div className="text-[9px] sm:text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-0.5 truncate">
                        TODAY'S SESSIONS
                      </div>
                      <div className="text-[9px] sm:text-[11px] text-gray-500 dark:text-zinc-400 font-medium truncate">
                        {todayWorkouts > 0 ? "Daily target active" : "Ready to hit gym"}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Row: Full-Width Sleek Horizontal Action Button */}
                <div 
                  onClick={() => navigate("/dashboard")}
                  className="cursor-pointer bg-gradient-to-r from-emerald-50 via-white to-gray-50 dark:from-lime-500/15 dark:via-zinc-900/95 dark:to-zinc-900 border border-emerald-200/80 dark:border-lime-500/30 hover:border-emerald-500 dark:hover:border-lime-400 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition-all duration-300 group hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(132,204,22,0.15)] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-100 dark:bg-lime-500/20 border border-emerald-200 dark:border-lime-500/40 text-emerald-600 dark:text-lime-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm md:text-base font-black text-gray-900 dark:text-white leading-tight group-hover:text-emerald-700 dark:group-hover:text-lime-300 transition-colors uppercase tracking-tight">
                        OPEN DASHBOARD
                      </div>
                      <div className="text-[9px] sm:text-xs text-gray-600 dark:text-zinc-400 font-medium line-clamp-1">
                        View performance analytics & training history
                      </div>
                    </div>
                  </div>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-100 dark:bg-lime-500/10 border border-emerald-200 dark:border-lime-500/30 flex items-center justify-center text-emerald-600 dark:text-lime-400 group-hover:translate-x-1 transition-transform flex-shrink-0">
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>
    ), [isAuthenticated, auth?.user, isOnline, stats?.isRealTime, totalWorkouts, todayWorkouts, navigate]);

  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "min-h-screen bg-black relative",
    },
    isLoading &&
      /*#__PURE__*/ React.createElement(LoadingScreen, {
        onLoadingComplete: handleLoadingComplete,
      }),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "relative",
      },
      /*#__PURE__*/ React.createElement(Hero, null),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "container mx-auto px-2 sm:px-6 py-3 sm:py-8 relative z-10 space-y-6 sm:space-y-12",
      },
      /*#__PURE__*/ React.createElement(
        "section",
        {
          "data-animate": true,
          "data-id": "status-bar",
          className: "mb-4 sm:mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: `transition-all duration-500 ${isVisible["status-bar"] ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`,
            style: {
              willChange: isVisible["status-bar"]
                ? "auto"
                : "transform, opacity",
            },
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "relative bg-zinc-900 border border-neutral-900 sm:border-2 p-2.5 sm:p-6 shadow-2xl",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center justify-between gap-2 sm:gap-6",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-2 sm:gap-3",
                },
                /*#__PURE__*/ React.createElement("div", {
                  className: `w-1.5 h-1.5 sm:w-2 sm:h-2 ${isOnline ? "bg-lime-500" : "bg-red-600"} animate-pulse`,
                }),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-[10px] sm:text-xs font-black text-white tracking-wider uppercase",
                  },
                  isOnline ? "LIVE" : "OFFLINE",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-1.5 sm:gap-2",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-lime-500 text-xs sm:text-sm",
                  },
                  /*#__PURE__*/ React.createElement(Timer, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-[10px] sm:text-xs text-white font-mono bg-black px-1.5 py-0.5 sm:px-2 sm:py-1 border border-neutral-900",
                  },
                  currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center gap-1.5 sm:gap-2 bg-black border border-lime-500 sm:border-2 px-2 py-1 sm:px-6 sm:py-3",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-lime-500 text-sm sm:text-lg",
                  },
                  /*#__PURE__*/ React.createElement(BicepsFlexed, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex flex-col leading-none",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "font-black text-white text-xs sm:text-lg tabular-nums",
                    },
                    "170+",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-[8px] sm:text-xs text-lime-500 font-black tracking-wide",
                    },
                    "WORKOUTS",
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      renderHomeStatsSection,
      /*#__PURE__*/ React.createElement(ParallaxSection, {
        id: "training-experience",
        imageSrc: Home1,
        imageAlt: "Elite Training Experience",
        accentColorClass: "lime-500",
        accentText: "Elite Training",
        badgeText: "PRO GRADE",
        titleTop: "ELITE TRAINING",
        titleBottom: "EXPERIENCE",
        descriptionPrefix: "Experience world-class training with ",
        descriptionHighlight: "state-of-the-art equipment",
        descriptionSuffix: " designed for elite performance.",
        imageBadges: [
          {
            title: "Equipment",
            value: "PRO",
            titleClass: "text-lime-500",
            valueClass: "text-white",
            borderClass: "border-lime-500",
          },
          {
            title: "Success",
            value: "98.7%",
            titleClass: "text-white",
            valueClass: "text-lime-500",
            borderClass: "border-white",
          },
        ],
        isReversed: false,
        onClick: () => navigate("/dashboard"),
      }),
      /*#__PURE__*/ React.createElement(ParallaxSection, {
        id: "strength-power",
        imageSrc: Home2,
        imageAlt: "Strength and Power Training",
        accentColorClass: "red-600",
        accentText: "Power & Strength",
        badgeText: "MAX INTENSITY",
        titleTop: "UNLEASH YOUR",
        titleBottom: "INNER BEAST",
        descriptionPrefix: "Push beyond limits with ",
        descriptionHighlight: "intense strength training",
        descriptionSuffix: ". Build raw power and determination.",
        imageBadges: [
          {
            title: "Power",
            value: "MAX",
            titleClass: "text-red-600",
            valueClass: "text-white",
            borderClass: "border-red-600",
          },
          {
            title: "Intensity",
            value: "BEAST",
            titleClass: "text-white",
            valueClass: "text-red-600",
            borderClass: "border-white",
          },
        ],
        isReversed: true,
        onClick: () => navigate("/plans"),
      }),
      /*#__PURE__*/ React.createElement(ParallaxSection, {
        id: "workout-tracking",
        imageSrc: Home3,
        imageAlt: "Workout Tracking",
        accentColorClass: "red-600",
        accentText: "Workout Tracking",
        badgeText: "SMART LOGGING",
        titleTop: "LOG EVERY",
        titleBottom: "REP & SET",
        descriptionPrefix: "Track ",
        descriptionHighlight: "every workout detail",
        descriptionSuffix: " with precision logging and real-time sync.",
        imageBadges: [
          {
            title: "Track",
            value: "LIVE",
            titleClass: "text-red-600",
            valueClass: "text-white",
            borderClass: "border-red-600",
          },
          {
            title: "Progress",
            value: "REAL-TIME",
            titleClass: "text-white",
            valueClass: "text-red-600",
            borderClass: "border-white",
          },
        ],
        isReversed: false,
        onClick: () => navigate("/library"),
      }),
      /*#__PURE__*/ React.createElement(ParallaxSection, {
        id: "analytics-progress",
        imageSrc: Home4,
        imageAlt: "Analytics and Progress",
        accentColorClass: "red-800",
        accentText: "Analytics",
        badgeText: "DATA DRIVEN",
        titleTop: "VISUALIZE YOUR",
        titleBottom: "PROGRESS",
        descriptionPrefix: "Monitor ",
        descriptionHighlight: "detailed analytics",
        descriptionSuffix: " with charts, trends, and performance insights.",
        imageBadges: [],
        isReversed: true,
        onClick: () => navigate("/analytics"),
      }),
      /*#__PURE__*/ React.createElement(ParallaxSection, {
        id: "workout-plans",
        imageSrc: Home5,
        imageAlt: "Workout Plans and Splits",
        accentColorClass: "red-500",
        accentText: "Custom Plans",
        badgeText: "PERSONALIZED",
        titleTop: "BUILD YOUR",
        titleBottom: "PERFECT PLAN",
        descriptionPrefix: "Create ",
        descriptionHighlight: "custom workout splits",
        descriptionSuffix: " tailored to your goals and schedule.",
        imageBadges: [],
        isReversed: false,
        onClick: () => navigate("/my-plans"),
      }),
      /*#__PURE__*/ React.createElement(ParallaxSection, {
        id: "nutrition-tracking",
        imageSrc: NutritionHome,
        imageAlt: "Nutrition Tracking",
        accentColorClass: "orange-500",
        accentText: "Nutrition",
        badgeText: "FUEL YOUR BODY",
        titleTop: "TRACK YOUR",
        titleBottom: "NUTRITION",
        descriptionPrefix: "Monitor ",
        descriptionHighlight: "meals, calories, and macros",
        descriptionSuffix: " to fuel your fitness goals.",
        imageBadges: [],
        isReversed: true,
        onClick: () => navigate("/nutrition"),
      }),
  ),
  /*#__PURE__*/ React.createElement(
    "section",
    {
      ref: scrollContainerRef,
      className: "relative w-full bg-black",
      // 600vh is a safe initial fallback; the useEffect immediately overwrites
      // this with the exact measured value via direct DOM style mutation.
      style: { height: "600vh" },
      id: "body-fat",
    },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-6 sm:py-8 bg-black",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center mb-2 sm:mb-4 px-3 flex-shrink-0 relative z-10",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "inline-flex items-center gap-1.5 sm:gap-4 mb-1 sm:mb-3",
              },
              /*#__PURE__*/ React.createElement("div", { className: "w-8 sm:w-20 h-[1px] sm:h-0.5 bg-red-600" }),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-[9px] sm:text-xs font-black tracking-[0.1em] sm:tracking-[0.2em] text-red-600 uppercase",
                },
                "Body Composition"
              ),
              /*#__PURE__*/ React.createElement("div", { className: "w-8 sm:w-20 h-[1px] sm:h-0.5 bg-red-600" })
            ),
            /*#__PURE__*/ React.createElement(
              "h2",
              {
                className: "text-xl sm:text-4xl md:text-5xl font-black mb-1 sm:mb-2 uppercase leading-[0.85] tracking-tight",
              },
              /*#__PURE__*/ React.createElement("span", { className: "text-white" }, "NATURAL BODY FAT "),
              /*#__PURE__*/ React.createElement("span", { className: "text-red-600" }, "PERCENTAGE GUIDE")
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              {
                className: "text-[10px] sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-snug font-medium",
              },
              "Understand how ",
              /*#__PURE__*/ React.createElement("span", { className: "text-red-600 font-black" }, "natural men look"),
              " at different body fat percentages."
            )
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "w-full overflow-hidden flex-1 flex items-center relative z-10 my-auto",
            },
            /*#__PURE__*/ React.createElement(
              motion.div,
              {
                ref: flexContainerRef,
                style: {
                  x: springX,
                  paddingRight: "40vw",
                  willChange: "transform",
                  transform: "translateZ(0)",
                },
                className: "flex gap-4 sm:gap-8 pl-[10vw] items-stretch h-[88%] sm:h-[94%] max-h-[550px] transform-gpu",
              },
              [
                {
                  percent: 45,
                  img: BF45,
                  title: "This is how natural men look at 45% body fat",
                  desc: "Severely obese range. High health risks including cardiovascular disease, diabetes, and joint problems. Mobility significantly impaired. Testosterone levels critically low. Immediate lifestyle changes essential.",
                  health: /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(Circle, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Critical",
                  ),
                  color: "red",
                },
                {
                  percent: 40,
                  img: BF40,
                  title: "This is how natural men look at 40% body fat",
                  desc: "Obese category. Major health concerns with metabolic syndrome risk. Energy levels very low. Hormonal imbalances severe. Testosterone production significantly suppressed. Medical intervention recommended.",
                  health: /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(Circle, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " High Risk",
                  ),
                  color: "red",
                },
                {
                  percent: 30,
                  img: BF30,
                  title: "This is how natural men look at 30% body fat",
                  desc: "Overweight to obese. Visible fat accumulation around midsection and chest. Reduced athletic performance. Testosterone levels below optimal. Increased inflammation. Weight loss strongly advised for health.",
                  health: /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(Circle, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Elevated Risk",
                  ),
                  color: "orange",
                },
                {
                  percent: 20,
                  img: BF20,
                  title: "This is how natural men look at 20% body fat",
                  desc: "Average range for men. Some muscle definition visible. Moderate energy levels. Testosterone within normal range. Good starting point for cutting phase. Healthy but room for improvement in physique.",
                  health: /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(Circle, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Average",
                  ),
                  color: "yellow",
                },
                {
                  percent: 15,
                  img: BF15,
                  title: "This is how natural men look at 15% body fat",
                  desc: "Fit and athletic appearance. Abs visible with good lighting. Strong muscle definition. Optimal testosterone production. Excellent energy and performance. Ideal for most natural lifters year-round.",
                  health: /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(Circle, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Healthy",
                  ),
                  color: "lime",
                },
                {
                  percent: 12,
                  img: BF12,
                  title: "This is how natural men look at 12% body fat",
                  desc: "Very lean and defined. Clear six-pack abs. Vascularity emerging. Peak testosterone levels. High energy but requires disciplined nutrition. Excellent for photo shoots and competitions.",
                  health: /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(Circle, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Athletic",
                  ),
                  color: "green",
                },
                {
                  percent: 10,
                  img: BF10,
                  title: "This is how natural men look at 10% body fat",
                  desc: "Shredded physique. Striations visible. Prominent vascularity. Maximum muscle definition. Testosterone optimal but hunger increases. Requires strict diet. Competition-ready condition for naturals.",
                  health: /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(Circle, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Peak",
                  ),
                  color: "blue",
                },
                {
                  percent: 8,
                  img: BF8,
                  title: "This is how natural men look at 8% body fat",
                  desc: "Stage-ready condition. Extreme definition and vascularity. Every muscle fiber visible. Hunger very high. Energy may fluctuate. Testosterone can drop if maintained too long. Not sustainable year-round.",
                  health: /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(Circle, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Contest",
                  ),
                  color: "purple",
                },
                {
                  percent: 5,
                  img: BF5,
                  title: "This is how natural men look at 5% body fat",
                  desc: "Extremely lean - unsustainable. Paper-thin skin. Severe hunger and fatigue. Testosterone crashes. Libido drops. Mental fog. Only achievable briefly for peak week. Health risks if prolonged. Not recommended.",
                  health: /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(AlertTriangle, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Extreme",
                  ),
                  color: "red",
                },
              ].map((bf, idx) =>
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    key: bf.percent,
                    className: "body-fat-card-wrapper flex-shrink-0 flex items-stretch transform-gpu",
                    style: {
                      transform: "translateZ(0)",
                      willChange: "transform",
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                    },
                  },
                  /*#__PURE__*/ React.createElement(BodyFatCard, {
                    bf: bf,
                    OptimizedImage: OptimizedImage,
                  })
                )
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "body-fat-card-wrapper flex-shrink-0 flex items-stretch transform-gpu",
                  style: {
                    transform: "translateZ(0)",
                    willChange: "transform",
                    WebkitBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                  },
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-4 sm:p-8 flex flex-col justify-center relative shadow-lg overflow-hidden w-full",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex flex-col gap-3 sm:gap-6",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "w-10 h-10 sm:w-14 sm:h-14 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md",
                      },
                      /*#__PURE__*/ React.createElement(Lightbulb, {
                        className: "w-5 h-5 sm:w-7 sm:h-7 text-red-600",
                      })
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "space-y-1.5 sm:space-y-4",
                      },
                      /*#__PURE__*/ React.createElement(
                        "h4",
                        {
                          className: "text-sm sm:text-2xl font-black text-white uppercase tracking-wide leading-tight",
                        },
                        "Natural Physique Reality"
                      ),
                      /*#__PURE__*/ React.createElement(
                        "p",
                        {
                          className: "text-[11px] sm:text-base text-zinc-400 leading-relaxed font-medium",
                        },
                        "These images represent ",
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-red-600 font-black",
                          },
                          "natural, drug-free physiques"
                        ),
                        " at various body fat percentages. For optimal health and testosterone, most natural men thrive between ",
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-lime-500 font-black",
                          },
                          "12-15%"
                        ),
                        ". Going below 10% requires extreme discipline and may not be sustainable long-term. Focus on ",
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-white font-black",
                          },
                          "progressive overload, consistent training, and proper nutrition"
                        ),
                        " for best results."
                      )
                    )
                  )
                )
              )
            ),
        ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "w-full flex flex-col items-center gap-2 z-20 pointer-events-none mt-4 sm:mt-6 flex-shrink-0",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "w-32 sm:w-56 h-[3px] bg-zinc-900 rounded-full overflow-hidden relative",
              },
              /*#__PURE__*/ React.createElement(motion.div, {
                style: {
                  scaleX: scrollYProgress,
                  transformOrigin: "left",
                },
                className: "absolute inset-0 bg-red-600",
              })
            ),
            /*#__PURE__*/ React.createElement(
              motion.span,
              {
                style: {
                  opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]),
                },
                className: "text-[9px] font-black text-red-600 uppercase tracking-widest animate-pulse flex items-center gap-1.5",
              },
              "Scroll down to explore \u2192"
            )
          )
        )
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: `container mx-auto px-2 sm:px-6 py-3 sm:py-8 relative z-10 transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"} space-y-6 sm:space-y-12 mt-6 sm:mt-12`,
        },
        showRestDay &&
        /*#__PURE__*/ React.createElement(
          "section",
          {
            "data-animate": true,
            "data-id": "rest-day",
            id: "rest-day",
            className: "mb-6 sm:mb-20",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: `transition-all duration-700 delay-975 ${isVisible["rest-day"] ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`,
              style: {
                willChange: isVisible["rest-day"]
                  ? "auto"
                  : "transform, opacity",
              },
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "relative bg-black p-4 sm:p-12 shadow-2xl",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center mb-8 sm:mb-12",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "inline-block",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "bg-zinc-900 px-6 py-4 sm:px-12 sm:py-6",
                    },
                    /*#__PURE__*/ React.createElement(
                      "h2",
                      {
                        className:
                          "text-3xl sm:text-6xl font-black text-white uppercase tracking-widest leading-none mb-2",
                      },
                      "REST DAY",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "flex items-center justify-center gap-2 mt-3",
                      },
                      /*#__PURE__*/ React.createElement("div", {
                        className: "w-2 h-2 bg-red-600 animate-pulse",
                      }),
                      /*#__PURE__*/ React.createElement(
                        "p",
                        {
                          className:
                            "text-xs sm:text-sm text-red-600 font-black uppercase tracking-wide",
                        },
                        "Recovery Active",
                      ),
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className:
                      "text-xs sm:text-base text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed mt-6",
                  },
                  "Muscles grow during rest. ",
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-red-600 font-black",
                    },
                    "Recover, stretch, fuel",
                  ),
                  " for tomorrow.",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "relative group transform transition-all duration-300 hover:translate-y-[-4px]",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "relative bg-zinc-900 border-2 border-red-600 shadow-2xl overflow-hidden group-hover:border-lime-500 transition-all duration-300",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "relative h-[320px] sm:h-[400px] overflow-hidden",
                      },
                      /*#__PURE__*/ React.createElement(OptimizedImage, {
                        src: ActiveRecovery,
                        alt: "Active Recovery",
                        className:
                          "w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105",
                      }),
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent",
                      }),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black to-transparent",
                        },
                        /*#__PURE__*/ React.createElement(
                          "h3",
                          {
                            className:
                              "text-lg sm:text-2xl font-black text-white uppercase leading-tight group-hover:text-lime-500 transition-colors duration-300",
                          },
                          "ACTIVE RECOVERY",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "p-4 sm:p-6 bg-zinc-900",
                      },
                      /*#__PURE__*/ React.createElement(
                        "ul",
                        {
                          className:
                            "space-y-2 text-xs sm:text-sm text-zinc-400 font-medium",
                        },
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-600 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Light cardio (20-30 min walk)",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-600 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Foam rolling techniques",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-600 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Mobility work & yoga",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-600 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Swimming or cycling (low intensity)",
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
                      "relative group transform transition-all duration-300 hover:translate-y-[-4px]",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "relative bg-zinc-900 border-2 border-red-700 shadow-2xl overflow-hidden group-hover:border-lime-500 transition-all duration-300",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "relative h-[320px] sm:h-[400px] overflow-hidden",
                      },
                      /*#__PURE__*/ React.createElement(OptimizedImage, {
                        src: StretchingProtocol,
                        alt: "Stretching Protocol",
                        className:
                          "w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105",
                      }),
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent",
                      }),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black to-transparent",
                        },
                        /*#__PURE__*/ React.createElement(
                          "h3",
                          {
                            className:
                              "text-lg sm:text-2xl font-black text-white uppercase leading-tight group-hover:text-lime-500 transition-colors duration-300",
                          },
                          "STRETCHING PROTOCOL",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "p-4 sm:p-6 bg-zinc-900",
                      },
                      /*#__PURE__*/ React.createElement(
                        "ul",
                        {
                          className:
                            "space-y-2 text-xs sm:text-sm text-zinc-400 font-medium",
                        },
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-700 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Full body stretch routine (15 min)",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-700 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Focus on tight muscle groups",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-700 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Hold each stretch 30-60 seconds",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-700 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Deep breathing & morning stretches",
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
                      "relative group transform transition-all duration-300 hover:translate-y-[-4px]",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "relative bg-zinc-900 border-2 border-red-600 shadow-2xl overflow-hidden group-hover:border-lime-500 transition-all duration-300",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "relative h-[320px] sm:h-[400px] overflow-hidden",
                      },
                      /*#__PURE__*/ React.createElement(OptimizedImage, {
                        src: RecoveryNutrition,
                        alt: "Recovery Nutrition",
                        className:
                          "w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105",
                      }),
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent",
                      }),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black to-transparent",
                        },
                        /*#__PURE__*/ React.createElement(
                          "h3",
                          {
                            className:
                              "text-lg sm:text-2xl font-black text-white uppercase leading-tight group-hover:text-lime-500 transition-colors duration-300",
                          },
                          "RECOVERY NUTRITION",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "p-4 sm:p-6 bg-zinc-900",
                      },
                      /*#__PURE__*/ React.createElement(
                        "ul",
                        {
                          className:
                            "space-y-2 text-xs sm:text-sm text-zinc-400 font-medium",
                        },
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-600 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Protein: 0.8-1g per lb bodyweight",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-600 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Hydration: 1 gallon water minimum",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-600 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Anti-inflammatory foods (berries, fish)",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "li",
                          {
                            className: "flex items-start gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-600 mt-1 font-black",
                            },
                            "\u2022",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Sleep: 7-9 hours for muscle repair",
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
                  className: "text-center mb-8 sm:mb-10 px-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "relative inline-block",
                  },
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className:
                        "text-sm sm:text-xl italic text-zinc-400 font-medium transition-opacity duration-500",
                    },
                    '"',
                    recoveryQuotes[recoveryQuoteIndex],
                    '"',
                  ),
                  /*#__PURE__*/ React.createElement("div", {
                    className:
                      "absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-red-600",
                  }),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "relative bg-zinc-900 border-2 border-lime-500 shadow-2xl group hover:border-white transition-all duration-300",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "grid lg:grid-cols-2 gap-0",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "relative w-full order-2 lg:order-1",
                    },
                    /*#__PURE__*/ React.createElement("img", {
                      src: Dominance,
                      alt: "Get Ready to Dominate",
                      loading: "lazy",
                      className:
                        "w-full h-auto transition-transform duration-700 group-hover:scale-105",
                    }),
                    /*#__PURE__*/ React.createElement("div", {
                      className:
                        "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-center lg:text-left",
                        },
                        /*#__PURE__*/ React.createElement(
                          "p",
                          {
                            className:
                              "text-xs sm:text-sm text-lime-500 font-black uppercase tracking-widest mb-2",
                          },
                          "Recovery Complete",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "h4",
                          {
                            className:
                              "text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase leading-tight",
                          },
                          "Return Stronger",
                          /*#__PURE__*/ React.createElement("br", null),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-lime-500",
                            },
                            "Unleash Hell",
                          ),
                        ),
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-black order-1 lg:order-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "space-y-4 sm:space-y-6",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        null,
                        /*#__PURE__*/ React.createElement(
                          "p",
                          {
                            className:
                              "text-xs sm:text-sm text-zinc-500 font-black uppercase tracking-wide mb-2",
                          },
                          "Prepare for Battle",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "h5",
                          {
                            className:
                              "text-lg sm:text-xl font-black text-white uppercase mb-3",
                          },
                          "Your Next Challenge Awaits",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "p",
                          {
                            className:
                              "text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed",
                          },
                          "Rest today, ",
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-lime-500 font-black",
                            },
                            "dominate tomorrow",
                          ),
                          ". Your body is recovering and preparing for the next intense session.",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => navigate("/my-plans"),
                          className:
                            "w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-lime-500 text-black font-black uppercase text-sm sm:text-base tracking-wide hover:bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-lime-500 inline-flex items-center justify-center gap-2",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          null,
                          /*#__PURE__*/ React.createElement(BicepsFlexed, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          null,
                          "View Your Plan",
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
        "section",
        {
          "data-animate": true,
          "data-id": "cta",
          id: "cta",
          className: "relative py-4 sm:py-20",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: `relative transition-all duration-700 delay-600 ${isVisible["cta"] ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`,
            style: {
              willChange: isVisible["cta"] ? "auto" : "transform, opacity",
            },
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "relative bg-black border-2 sm:border-4 border-lime-500 shadow-2xl overflow-hidden",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "grid lg:grid-cols-2 gap-0",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "relative w-full overflow-hidden order-2 lg:order-1 lg:h-full",
                },
                /*#__PURE__*/ React.createElement("img", {
                  src: Again,
                  alt: "Elite Training",
                  loading: "lazy",
                  className: "w-full h-auto lg:h-full lg:object-cover transition-transform duration-700 hover:scale-105",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "p-5 xs:p-7 sm:p-12 lg:p-16 flex flex-col justify-center bg-black order-1 lg:order-2",
                },
                /*#__PURE__*/ React.createElement("div", {
                  className:
                    "absolute top-0 right-0 w-16 sm:w-32 h-1 bg-lime-500",
                }),
                /*#__PURE__*/ React.createElement("div", {
                  className:
                    "absolute bottom-0 right-0 w-16 sm:w-32 h-1 bg-lime-500",
                }),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "relative z-10",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "inline-flex items-center gap-1.5 sm:gap-3 px-2.5 py-1 sm:px-5 sm:py-2.5 bg-zinc-950/60 border border-lime-500/20 mb-4 sm:mb-8 rounded-md w-fit",
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      className: "w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className:
                          "text-[9px] sm:text-xs font-black tracking-[0.15em] text-lime-500 uppercase font-body",
                      },
                      "Elite Access",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "h2",
                    {
                      className:
                        "text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 sm:mb-6 uppercase leading-[0.9]",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "text-white block mb-1 sm:mb-2",
                      },
                      "STOP",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "text-white block mb-1 sm:mb-2",
                      },
                      "WASTING",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "text-lime-500 block",
                      },
                      "TIME",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "mb-5 sm:mb-8",
                    },
                    /*#__PURE__*/ React.createElement(
                      "p",
                      {
                        className:
                          "text-xs sm:text-lg text-zinc-400 font-bold uppercase tracking-wider",
                      },
                      "Track. Dominate. Repeat.",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex flex-row gap-2.5 xs:gap-3.5 w-full",
                    },
                    isAuthenticated()
                      ? /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => navigate("/dashboard"),
                            className:
                              "group relative flex-1 px-4 py-3.5 sm:px-10 sm:py-5 text-xs xs:text-sm sm:text-lg font-black bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 text-black shadow-lg transform transition-all duration-300 active:scale-95 focus:outline-none focus:ring-4 focus:ring-lime-500 uppercase tracking-wide overflow-hidden flex items-center justify-center rounded-lg",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "relative z-10 flex items-center justify-center gap-2",
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "text-base sm:text-2xl",
                              },
                              /*#__PURE__*/ React.createElement(BicepsFlexed, {
                                className: "w-[1em] h-[1em] inline-block",
                              }),
                            ),
                            /*#__PURE__*/ React.createElement(
                              "span",
                              null,
                              "DASHBOARD",
                            ),
                          ),
                          /*#__PURE__*/ React.createElement("div", {
                            className:
                              "absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left",
                          }),
                        )
                      : /*#__PURE__*/ React.createElement(
                          React.Fragment,
                          null,
                          /*#__PURE__*/ React.createElement(
                            "button",
                            {
                              onClick: () => navigate("/register"),
                              className:
                                "group relative flex-1 px-4 py-3.5 sm:px-10 sm:py-5 text-xs xs:text-sm sm:text-lg font-black bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 text-black shadow-lg transform transition-all duration-300 active:scale-95 focus:outline-none focus:ring-4 focus:ring-lime-500 uppercase tracking-wide overflow-hidden flex items-center justify-center rounded-lg",
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className:
                                  "relative z-10 flex items-center justify-center gap-2",
                              },
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "text-base sm:text-2xl",
                                },
                                /*#__PURE__*/ React.createElement(Zap, {
                                  className: "w-[1em] h-[1em] inline-block",
                                }),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "span",
                                null,
                                "START NOW",
                              ),
                            ),
                            /*#__PURE__*/ React.createElement("div", {
                              className:
                                "absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left",
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "button",
                            {
                              onClick: () => navigate("/login"),
                              className:
                                "flex-1 px-4 py-3.5 sm:px-10 sm:py-5 text-xs xs:text-sm sm:text-lg font-black bg-[#0D0D0D] border border-zinc-800 hover:bg-zinc-900 text-white shadow-lg transform transition-all duration-300 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white uppercase tracking-wide flex items-center justify-center rounded-lg",
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className:
                                  "flex items-center justify-center gap-2",
                              },
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "text-base sm:text-2xl",
                                },
                                /*#__PURE__*/ React.createElement(Star, {
                                  className: "w-[1em] h-[1em] inline-block",
                                }),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "span",
                                null,
                                "LOGIN",
                              ),
                            ),
                          ),
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
      "style",
      null,
      `
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          @keyframes animate-in {
            from { opacity: 0; transform: translate3d(100%, 0, 0); }
            to { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          
          .animate-in { 
            animation: animate-in 0.3s ease-out;
            will-change: transform, opacity;
          }
          
          .slide-in-from-right { animation-name: animate-in; }
          
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
          
          [data-animate] {
            will-change: transform, opacity;
            transform: translate3d(0, 0, 0);
          }
          
          img {
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          
          .group:hover img {
            transform: translate3d(0, 0, 0) scale(1.05);
          }

          /* Goated Responsive Sizing for Scroll Pinning Cards */
          .body-fat-card-wrapper {
            width: 300px;
            flex-shrink: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: stretch;
          }
          .body-fat-spacer {
            width: 15vw;
            min-width: 15vw;
            flex-shrink: 0;
          }
          @media (min-width: 640px) {
            .body-fat-spacer {
              width: 25vw;
              min-width: 25vw;
            }
          }
          @media (max-height: 800px) {
            .body-fat-card-wrapper .p-4,
            .body-fat-card-wrapper .sm\\:p-5 {
              padding: 0.75rem !important;
            }
            .body-fat-card-wrapper .space-y-2\\.5 > * + *,
            .body-fat-card-wrapper .sm\\:space-y-3\\.5 > * + * {
              margin-top: 0.4rem !important;
            }
            .body-fat-card-wrapper p {
              font-size: 11.5px !important;
              line-height: 1.4 !important;
            }
          }
          @media (max-height: 700px) {
            .body-fat-card-wrapper {
              width: 260px !important;
            }
            .body-fat-card-wrapper .relative.h-\\[300px\\] {
              height: 260px !important;
            }
            .body-fat-card-wrapper p {
              font-size: 11px !important;
              line-height: 1.35 !important;
            }
          }
          @media (max-height: 600px) {
            .body-fat-card-wrapper {
              width: 200px !important;
            }
            .body-fat-card-wrapper .relative.h-\\[300px\\] {
              height: 200px !important;
            }
            .body-fat-card-wrapper p {
              font-size: 10px !important;
              line-height: 1.3 !important;
            }
          }
        `,
    ),
  );
}
