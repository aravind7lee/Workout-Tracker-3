import { User, Edit3, ThumbsUp, Briefcase, GraduationCap, Shield, Sparkles } from 'lucide-react';
import "./utils/comprehensiveErrorHandler"; // Must be first to catch all errors
// XP Points System Removed - Cache Bust v1.0
import "./utils/immediateCleanup"; // Clean fake workouts immediately
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useSearchParams,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RealTimeProvider } from "./context/RealTimeContext";
import { WorkoutCompletionProvider } from "./context/WorkoutCompletionContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import LibrarySimple from "./pages/LibrarySimple";
import Analytics from "./pages/Analytics";
import Nutrition from "./pages/Nutrition";
import PlansBuilder from "./pages/PlansBuilder";
import MyPlans from "./pages/MyPlans";
import EditPlan from "./pages/EditPlan";
import WorkoutSession from "./pages/WorkoutSession";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Forum from "./pages/Forum";
import Contact from "./pages/Contact";
import StartWorkout from "./pages/StartWorkout";
import Workouts from "./pages/Workouts";
import WorkoutDetails from "./pages/WorkoutDetails";
import WorkoutsTest from "./pages/WorkoutsTest";
import WorkoutsFixed from "./pages/WorkoutsFixed";
import WorkoutsComplete from "./pages/WorkoutsComplete";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import ErrorBoundary from "./components/ErrorBoundary";
import ChromeErrorBoundary from "./components/ChromeErrorBoundary";
import ThemeErrorBoundary from "./components/ThemeErrorBoundary";
import WorkoutCompletionHandler from "./components/WorkoutCompletionHandler";
import PRNotification from "./components/PRNotification";
import ScrollToTop from "./components/ScrollToTop";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import LegendsAndInfluencers from "./pages/LegendsAndInfluencers";
import WorkoutSplits from "./pages/WorkoutSplits";
import CustomSplitBuilder from "./pages/CustomSplitBuilder";
import YourWorkoutSplits from "./pages/YourWorkoutSplits";
import EditSplit from "./pages/EditSplit";
import StreakHistory from "./pages/StreakHistory";
import chromeErrorHandler from "./utils/chromeErrorHandler";
import "./utils/finalErrorCleanup"; // Stop continuous API calls
import "./utils/silentMode"; // Complete console silence
import "./utils/errorSuppression"; // Suppress import errors

import "./utils/testWorkoutCompletion"; // Test utilities for real-time updates
import "./utils/testPlanWorkoutCompletion"; // Test plan workout completion flow
import "./utils/cleanupFakeWorkouts"; // Cleanup fake workouts

import "./styles/button-improvements.css"; // Global button improvements


// Inline components to avoid module loading errors
const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const exercises = [
    {
      id: 1,
      name: "Push-ups",
      category: "Chest",
      difficulty: "Beginner",
    },
    {
      id: 2,
      name: "Squats",
      category: "Legs",
      difficulty: "Beginner",
    },
    {
      id: 3,
      name: "Pull-ups",
      category: "Back",
      difficulty: "Intermediate",
    },
    {
      id: 4,
      name: "Deadlifts",
      category: "Back",
      difficulty: "Advanced",
    },
    {
      id: 5,
      name: "Bench Press",
      category: "Chest",
      difficulty: "Intermediate",
    },
  ];
  useEffect(() => {
    if (query) {
      const filtered = exercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(query.toLowerCase()) ||
          exercise.category.toLowerCase().includes(query.toLowerCase()),
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "max-w-4xl mx-auto py-8",
    },
    /*#__PURE__*/ React.createElement(
      "h1",
      {
        className: "text-3xl font-bold text-white mb-4",
      },
      "Search Results",
    ),
    query &&
      /*#__PURE__*/ React.createElement(
        "p",
        {
          className: "text-gray-400 mb-6",
        },
        'Results for: "',
        query,
        '"',
      ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "space-y-4",
      },
      results.map((exercise) =>
        /*#__PURE__*/ React.createElement(
          "div",
          {
            key: exercise.id,
            className: "bg-gray-800 rounded-lg shadow-md p-6",
          },
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-xl font-semibold text-white mb-2",
            },
            exercise.name,
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center space-x-4 mb-4",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className:
                  "px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm",
              },
              exercise.category,
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className:
                  "px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm",
              },
              exercise.difficulty,
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: () => navigate(`/exercises/${exercise.id}`),
              className:
                "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
            },
            "View Details",
          ),
        ),
      ),
      results.length === 0 &&
        query &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-center py-12",
          },
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-lg font-medium text-white mb-2",
            },
            "No results found",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-gray-400",
            },
            "Try different keywords",
          ),
        ),
    ),
  );
};
const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const exercises = {
    1: {
      id: 1,
      name: "Push-ups",
      category: "Chest",
      difficulty: "Beginner",
      description: "Classic bodyweight exercise",
    },
    2: {
      id: 2,
      name: "Squats",
      category: "Legs",
      difficulty: "Beginner",
      description: "Fundamental leg exercise",
    },
    3: {
      id: 3,
      name: "Pull-ups",
      category: "Back",
      difficulty: "Intermediate",
      description: "Upper body pulling exercise",
    },
    4: {
      id: 4,
      name: "Deadlifts",
      category: "Back",
      difficulty: "Advanced",
      description: "Compound lifting movement",
    },
    5: {
      id: 5,
      name: "Bench Press",
      category: "Chest",
      difficulty: "Intermediate",
      description: "Chest pressing exercise",
    },
  };
  useEffect(() => {
    const exerciseData = exercises[id] || exercises[1];
    setExercise(exerciseData);
  }, [id]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [userReviews, setUserReviews] = useState([]);

  // Load user reviews on component mount
  useEffect(() => {
    try {
      const savedReviews = JSON.parse(
        localStorage.getItem(`reviews_${id}`) || "[]",
      );
      setUserReviews(savedReviews);
    } catch (error) {
      setUserReviews([]);
    }
  }, [id]);
  const handleSubmitReview = () => {
    if (userRating > 0) {
      try {
        const reviews = JSON.parse(
          localStorage.getItem(`reviews_${id}`) || "[]",
        );
        const newReview = {
          id: Date.now(),
          rating: userRating,
          comment: userComment,
          author: "You",
          avatar: /*#__PURE__*/ React.createElement(User, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          date: new Date().toLocaleDateString(),
          helpful: 0,
        };
        const updatedReviews = [newReview, ...reviews];
        localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));
        setUserReviews(updatedReviews);

        // Reset form
        setShowReviewForm(false);
        setUserRating(0);
        setUserComment("");
      } catch (error) {
        console.error("Error saving review:", error);
      }
    }
  };
  if (!exercise)
    return /*#__PURE__*/ React.createElement("div", null, "Loading...");
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "max-w-4xl mx-auto py-8",
    },
    /*#__PURE__*/ React.createElement(
      "button",
      {
        onClick: () => navigate(-1),
        className: "mb-6 text-blue-600 hover:text-blue-800",
      },
      "\u2190 Back",
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "bg-gray-800 rounded-lg shadow-lg p-8",
      },
      /*#__PURE__*/ React.createElement(
        "h1",
        {
          className: "text-3xl font-bold text-white mb-4",
        },
        exercise.name,
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex items-center space-x-4 mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "span",
          {
            className: "px-3 py-1 bg-blue-900 text-blue-200 rounded-full",
          },
          exercise.category,
        ),
        /*#__PURE__*/ React.createElement(
          "span",
          {
            className: "px-3 py-1 bg-green-900 text-green-200 rounded-full",
          },
          exercise.difficulty,
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "p",
        {
          className: "text-gray-400 mb-6",
        },
        exercise.description,
      ),
      /*#__PURE__*/ React.createElement(
        "button",
        {
          className:
            "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
        },
        "Start Exercise",
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "mt-8 bg-gray-700 rounded-lg p-6",
        },
        /*#__PURE__*/ React.createElement(
          "h3",
          {
            className: "text-xl font-bold text-white mb-4",
          },
          "Reviews & Ratings",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex items-center space-x-2 mb-4",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center",
            },
            [1, 2, 3, 4, 5].map((star) =>
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  key: star,
                  className: "text-yellow-400 text-xl",
                },
                "\u2605",
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "text-gray-400",
            },
            "4.8 (24 reviews)",
          ),
        ),
        !showReviewForm
          ? /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () => setShowReviewForm(true),
                className:
                  "mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700",
              },
              /*#__PURE__*/ React.createElement(Edit3, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Write a Review",
            )
          : /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "mb-6 p-4 bg-gray-800 rounded-lg border",
              },
              /*#__PURE__*/ React.createElement(
                "h4",
                {
                  className: "font-semibold text-white mb-3",
                },
                "Write Your Review",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "mb-4",
                },
                /*#__PURE__*/ React.createElement(
                  "label",
                  {
                    className: "block text-sm font-medium text-gray-300 mb-2",
                  },
                  "Rating",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center space-x-1",
                  },
                  [1, 2, 3, 4, 5].map((star) =>
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        key: star,
                        onClick: () => setUserRating(star),
                        className:
                          "text-2xl hover:scale-110 transition-transform",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            star <= userRating
                              ? "text-yellow-400"
                              : "text-gray-300",
                        },
                        "\u2605",
                      ),
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "mb-4",
                },
                /*#__PURE__*/ React.createElement(
                  "label",
                  {
                    className: "block text-sm font-medium text-gray-300 mb-2",
                  },
                  "Comment",
                ),
                /*#__PURE__*/ React.createElement("textarea", {
                  value: userComment,
                  onChange: (e) => setUserComment(e.target.value),
                  placeholder: "Share your experience with this exercise...",
                  className:
                    "w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white",
                  rows: 3,
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center space-x-3",
                },
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: handleSubmitReview,
                    disabled: userRating === 0,
                    className:
                      "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                  },
                  "Submit Review",
                ),
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: () => {
                      setShowReviewForm(false);
                      setUserRating(0);
                      setUserComment("");
                    },
                    className: "px-4 py-2 text-gray-400 hover:text-gray-200",
                  },
                  "Cancel",
                ),
              ),
            ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-4",
          },
          userReviews.map((review) =>
            /*#__PURE__*/ React.createElement(
              "div",
              {
                key: review.id,
                className: "border-b border-gray-600 pb-4",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center space-x-2 mb-2",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-2xl",
                  },
                  review.avatar,
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "font-medium text-white",
                  },
                  review.author,
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex",
                  },
                  [1, 2, 3, 4, 5].map((star) =>
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        key: star,
                        className:
                          star <= review.rating
                            ? "text-yellow-400"
                            : "text-gray-300",
                      },
                      "\u2605",
                    ),
                  ),
                ),
                review.author === "You" &&
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "px-2 py-1 bg-green-900 text-green-200 rounded-full text-xs",
                    },
                    "Your Review",
                  ),
              ),
              review.comment &&
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className: "text-gray-300 mb-2",
                  },
                  review.comment,
                ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center justify-between text-sm text-gray-500",
                },
                /*#__PURE__*/ React.createElement("span", null, review.date),
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    className: "hover:text-blue-600",
                  },
                  /*#__PURE__*/ React.createElement(ThumbsUp, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Helpful (",
                  review.helpful,
                  ")",
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "border-b border-gray-600 pb-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center space-x-2 mb-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-2xl",
                },
                /*#__PURE__*/ React.createElement(User, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                /*#__PURE__*/ React.createElement(Briefcase, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "font-medium text-white",
                },
                "Alex Johnson",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex",
                },
                [1, 2, 3, 4, 5].map((star) =>
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      key: star,
                      className: "text-yellow-400",
                    },
                    "\u2605",
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              {
                className: "text-gray-300 mb-2",
              },
              "Excellent exercise! Really helped build my strength and the instructions are clear.",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center justify-between text-sm text-gray-500",
              },
              /*#__PURE__*/ React.createElement("span", null, "2 days ago"),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  className: "hover:text-blue-600",
                },
                /*#__PURE__*/ React.createElement(ThumbsUp, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Helpful (5)",
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "border-b border-gray-600 pb-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center space-x-2 mb-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-2xl",
                },
                /*#__PURE__*/ React.createElement(User, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                /*#__PURE__*/ React.createElement(User, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "font-medium text-white",
                },
                "Sarah Wilson",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex",
                },
                [1, 2, 3, 4].map((star) =>
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      key: star,
                      className: "text-yellow-400",
                    },
                    "\u2605",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-gray-300",
                  },
                  "\u2605",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              {
                className: "text-gray-300 mb-2",
              },
              "Great for beginners! Perfect form demonstration and easy to follow.",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center justify-between text-sm text-gray-500",
              },
              /*#__PURE__*/ React.createElement("span", null, "1 week ago"),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  className: "hover:text-blue-600",
                },
                /*#__PURE__*/ React.createElement(ThumbsUp, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Helpful (3)",
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "pb-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center space-x-2 mb-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-2xl",
                },
                /*#__PURE__*/ React.createElement(User, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                /*#__PURE__*/ React.createElement(GraduationCap, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "font-medium text-white",
                },
                "Mike Chen",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex",
                },
                [1, 2, 3, 4, 5].map((star) =>
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      key: star,
                      className: "text-yellow-400",
                    },
                    "\u2605",
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              {
                className: "text-gray-300 mb-2",
              },
              "Challenging but effective. Saw results quickly after adding this to my routine.",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center justify-between text-sm text-gray-500",
              },
              /*#__PURE__*/ React.createElement("span", null, "2 weeks ago"),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  className: "hover:text-blue-600",
                },
                /*#__PURE__*/ React.createElement(ThumbsUp, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Helpful (8)",
              ),
            ),
          ),
        ),
      ),
    ),
  );
};
const OnboardingGate = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (location.pathname === '/onboarding' && !isAuthenticated()) {
    return /*#__PURE__*/ React.createElement(Navigate, { to: "/register", replace: true });
  }
  const isSplitBrowser = ['/splits', '/workout-splits'].includes(location.pathname) && location.state?.fromOnboarding;
  if (user?.onboardingCompleted === false && location.pathname !== '/onboarding' && !isSplitBrowser) {
    return /*#__PURE__*/ React.createElement(Navigate, { to: "/onboarding", replace: true });
  }
  return null;
};

const OnboardingLauncher = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hiddenRoutes = ['/onboarding', '/login', '/register', '/workout-session', '/active-workout'];

  if (loading || !user || !isAuthenticated() || hiddenRoutes.includes(location.pathname)) return null;

  return /*#__PURE__*/ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => navigate('/onboarding'),
      className: "onboarding-launcher fixed bottom-24 right-4 z-[90] inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_12px_35px_rgba(220,38,38,0.4)] transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-950 md:bottom-8 md:right-8",
      "aria-label": user.onboardingCompleted ? "Open fitness profile" : "Complete fitness setup",
      title: user.onboardingCompleted ? "Open fitness profile" : "Complete fitness setup",
    },
    /*#__PURE__*/ React.createElement(Sparkles, { className: "h-4 w-4" }),
    /*#__PURE__*/ React.createElement(
      "span",
      { className: "hidden sm:inline" },
      user.onboardingCompleted ? "Fitness Profile" : "Complete Fitness Setup",
    ),
  );
};

export default function App() {
  // Initialize Chrome error handler
  useEffect(() => {
    console.log("🛡️ Chrome error handler initialized");
  }, []);
  return /*#__PURE__*/ React.createElement(
    ChromeErrorBoundary,
    null,
    /*#__PURE__*/ React.createElement(
      ErrorBoundary,
      null,
      /*#__PURE__*/ React.createElement(
        ThemeErrorBoundary,
        null,
        /*#__PURE__*/ React.createElement(
          ThemeProvider,
          null,
          /*#__PURE__*/ React.createElement(
            AuthProvider,
            null,
            /*#__PURE__*/ React.createElement(OnboardingGate, null),
            /*#__PURE__*/ React.createElement(
              RealTimeProvider,
              null,
              /*#__PURE__*/ React.createElement(
                WorkoutCompletionProvider,
                null,
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "min-h-screen",
                  },
                  /*#__PURE__*/ React.createElement(ScrollToTop, null),
                  /*#__PURE__*/ React.createElement(OnboardingLauncher, null),
                  /*#__PURE__*/ React.createElement(PRNotification, null),
                  /*#__PURE__*/ React.createElement(Navbar, null),
                  /*#__PURE__*/ React.createElement(
                    WorkoutCompletionHandler,
                    null,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "main",
                    {
                      className: "app-main pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen",
                    },
                    /*#__PURE__*/ React.createElement(
                      Routes,
                      null,
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/",
                        element: /*#__PURE__*/ React.createElement(Home, null),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/register",
                        element: /*#__PURE__*/ React.createElement(
                          Register,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/login",
                        element: /*#__PURE__*/ React.createElement(Login, null),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/onboarding",
                        element: /*#__PURE__*/ React.createElement(Onboarding, null),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/dashboard",
                        element: /*#__PURE__*/ React.createElement(
                          Dashboard,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/library",
                        element: /*#__PURE__*/ React.createElement(
                          Library,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/exercise-library",
                        element: /*#__PURE__*/ React.createElement(
                          Library,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/analytics",
                        element: /*#__PURE__*/ React.createElement(
                          Analytics,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/nutrition",
                        element: /*#__PURE__*/ React.createElement(
                          Nutrition,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/plans",
                        element: /*#__PURE__*/ React.createElement(
                          PlansBuilder,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/my-plans",
                        element: /*#__PURE__*/ React.createElement(
                          MyPlans,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/splits",
                        element: /*#__PURE__*/ React.createElement(
                          WorkoutSplits,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/workout-splits",
                        element: /*#__PURE__*/ React.createElement(
                          WorkoutSplits,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/custom-split-builder",
                        element: /*#__PURE__*/ React.createElement(
                          CustomSplitBuilder,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/your-workout-splits",
                        element: /*#__PURE__*/ React.createElement(
                          YourWorkoutSplits,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/edit-split/:splitId",
                        element: /*#__PURE__*/ React.createElement(
                          EditSplit,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/edit-plan/:planId",
                        element: /*#__PURE__*/ React.createElement(
                          EditPlan,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/workout/:planId",
                        element: /*#__PURE__*/ React.createElement(
                          WorkoutSession,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/workout-session",
                        element: /*#__PURE__*/ React.createElement(
                          WorkoutSession,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/active-workout",
                        element: /*#__PURE__*/ React.createElement(
                          WorkoutSession,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/profile",
                        element: /*#__PURE__*/ React.createElement(
                          Profile,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/settings",
                        element: /*#__PURE__*/ React.createElement(
                          Settings,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/forum",
                        element: /*#__PURE__*/ React.createElement(Forum, null),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/contact",
                        element: /*#__PURE__*/ React.createElement(
                          Contact,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/start-workout",
                        element: /*#__PURE__*/ React.createElement(
                          StartWorkout,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/workouts",
                        element: /*#__PURE__*/ React.createElement(
                          Workouts,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/workout-details/:workoutId",
                        element: /*#__PURE__*/ React.createElement(
                          WorkoutDetails,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/legends",
                        element: /*#__PURE__*/ React.createElement(
                          LegendsAndInfluencers,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/champs",
                        element: /*#__PURE__*/ React.createElement(
                          LegendsAndInfluencers,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/streak-history",
                        element: /*#__PURE__*/ React.createElement(
                          StreakHistory,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/streak-analytics",
                        element: /*#__PURE__*/ React.createElement(
                          StreakHistory,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/streak",
                        element: /*#__PURE__*/ React.createElement(
                          StreakHistory,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/search",
                        element: /*#__PURE__*/ React.createElement(
                          Search,
                          null,
                        ),
                      }),
                      /*#__PURE__*/ React.createElement(Route, {
                        path: "/exercises/:id",
                        element: /*#__PURE__*/ React.createElement(
                          ExerciseDetail,
                          null,
                        ),
                      }),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(Footer, null),
                  /*#__PURE__*/ React.createElement(MobileBottomNav, null),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
