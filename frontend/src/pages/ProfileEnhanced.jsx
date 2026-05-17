// frontend/src/pages/ProfileEnhanced.jsx - ENHANCED GYM-THEMED PROFILE
import { Dumbbell, Utensils, ClipboardList, CheckCircle2, XCircle, AlertTriangle, RefreshCw, DoorOpen, User, Key, BicepsFlexed, Star, Zap, Save, Image, Edit, Pencil, BarChart3, Cloud, Target, Rocket, Apple, Book, TrendingUp, Trophy, Flame } from 'lucide-react';
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ImageUploader from "../components/ImageUploader";
import AuthGuard from "../components/AuthGuard";
import api from "../utils/api";

// Import gym-themed background images
import GymBg1 from "../assets/wp8463825-male-workout-wallpapers.jpg";
import GymBg2 from "../assets/woman-gym-body-building.jpg";
import ArnoldBg from "../assets/Arnold Schwarzenegge1.jpg";
import ChrisBg from "../assets/ChrisBumstead1.jpg";


const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const navigate = useNavigate();

  // Real-time data fetching
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch all profile data in parallel
      const [profileRes, statsRes, activityRes, achievementsRes] =
        await Promise.allSettled([
          api.get("/users/profile"),
          api.get("/users/stats"),
          api.get("/users/activity"),
          api.get("/users/achievements"),
        ]);

      // Handle profile data
      if (profileRes.status === "fulfilled") {
        const profileData = profileRes.value.data;
        setUser(profileData);
        localStorage.setItem("user", JSON.stringify(profileData));
        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
        });
      } else {
        // Fallback to localStorage
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (localUser.name) {
          setUser(localUser);
          setFormData({
            name: localUser.name || "",
            email: localUser.email || "",
          });
        }
      }

      // Handle stats data
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      } else {
        setStats(getFallbackStats());
      }

      // Handle activity data
      if (activityRes.status === "fulfilled") {
        setActivity(activityRes.value.data);
      } else {
        setActivity([]);
      }

      // Handle achievements data
      if (achievementsRes.status === "fulfilled") {
        setAchievements(achievementsRes.value.data);
      } else {
        setAchievements([]);
      }
      setLastSync(new Date());
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile data");

      // Try to load from localStorage as fallback
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (localUser.name) {
        setUser(localUser);
        setFormData({
          name: localUser.name || "",
          email: localUser.email || "",
        });
        setStats(getFallbackStats());
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Get fallback stats from localStorage
  const getFallbackStats = () => {
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    const meals = JSON.parse(localStorage.getItem("recentMeals") || "[]");
    const plans = JSON.parse(localStorage.getItem("workoutPlans") || "[]");
    return {
      totalWorkouts: workouts.filter((w) => w.completed).length,
      totalMeals: meals.length,
      totalPlans: plans.length,
      currentStreak: 0,
      xpPoints: workouts.length * 100,
      totalCaloriesBurned: workouts.reduce(
        (sum, w) => sum + (w.caloriesBurned || 0),
        0,
      ),
      membershipDays: 0,
      isRealTime: false,
    };
  };

  // Real-time event listeners
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Initial data fetch
    fetchProfileData();

    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      fetchProfileData(); // Refresh data when coming back online
    };
    const handleOffline = () => setIsOnline(false);

    // Real-time update listeners
    const handleWorkoutComplete = () => {
      console.log("🏋️ Workout completed - refreshing profile");
      setTimeout(fetchProfileData, 1000); // Small delay for backend processing
    };
    const handleMealAdded = () => {
      console.log("🍽️ Meal added - refreshing profile");
      setTimeout(fetchProfileData, 1000);
    };
    const handlePlanCreated = () => {
      console.log("📋 Plan created - refreshing profile");
      setTimeout(fetchProfileData, 1000);
    };

    // Event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("workoutCompleted", handleWorkoutComplete);
    window.addEventListener("mealAdded", handleMealAdded);
    window.addEventListener("planCreated", handlePlanCreated);

    // Auto-refresh every 30 seconds when online
    const refreshInterval = setInterval(() => {
      if (navigator.onLine) {
        fetchProfileData();
      }
    }, 30000);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("workoutCompleted", handleWorkoutComplete);
      window.removeEventListener("mealAdded", handleMealAdded);
      window.removeEventListener("planCreated", handlePlanCreated);
      clearInterval(refreshInterval);
    };
  }, [navigate, fetchProfileData]);
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put("/users/profile", formData);
      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditing(false);

      // Show success message
      const successMsg = document.createElement("div");
      successMsg.className =
        "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50";
      successMsg.textContent = "✅ Profile updated successfully!";
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);
    } catch (error) {
      console.error("Profile update error:", error);
      // Show error message
      const errorMsg = document.createElement("div");
      errorMsg.className =
        "fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50";
      errorMsg.textContent = "❌ Failed to update profile";
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 3000);
    } finally {
      setSaving(false);
    }
  };
  const handleImageUpdate = async (imageUrl) => {
    try {
      // Update profile with new image URL (Cloudinary handles persistence)
      const response = await api.put("/users/profile", {
        ...formData,
        profileImage: imageUrl,
      });
      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("✅ Profile image updated and synced across devices");
    } catch (error) {
      console.error("Image update error:", error);
      // Still update locally for offline functionality
      const updatedUser = {
        ...user,
        profileImage: imageUrl,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  if (error && !user) {
    return /*#__PURE__*/ React.createElement(
      motion.div,
      {
        className: "text-center py-12",
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
          className: "text-6xl mb-6",
        },
        /*#__PURE__*/ React.createElement(AlertTriangle, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      ),
      /*#__PURE__*/ React.createElement(
        "h2",
        {
          className: "text-2xl font-bold text-white mb-4",
        },
        "Connection Issue",
      ),
      /*#__PURE__*/ React.createElement(
        "p",
        {
          className: "text-neutral-400 mb-4",
        },
        error,
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex gap-3 justify-center",
        },
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: fetchProfileData,
            className: "btn bg-red-700 hover:bg-blue-700 text-white",
          },
          /*#__PURE__*/ React.createElement(RefreshCw, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          " Retry",
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: () => navigate("/login"),
            className: "btn bg-neutral-700 hover:bg-neutral-800 text-white",
          },
          /*#__PURE__*/ React.createElement(DoorOpen, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          " Re-login",
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "p",
        {
          className: "text-neutral-500 text-sm mt-4",
        },
        isOnline
          ? "Check your internet connection"
          : "You are currently offline",
      ),
    );
  }
  if (!user) {
    return /*#__PURE__*/ React.createElement(
      motion.div,
      {
        className: "text-center py-12",
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
          className: "text-6xl mb-6",
        },
        /*#__PURE__*/ React.createElement(User, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      ),
      /*#__PURE__*/ React.createElement(
        "h2",
        {
          className: "text-2xl font-bold text-white mb-4",
        },
        "Profile Not Found",
      ),
      /*#__PURE__*/ React.createElement(
        "p",
        {
          className: "text-neutral-400 mb-4",
        },
        "Please log in to view your profile",
      ),
      /*#__PURE__*/ React.createElement(
        "button",
        {
          onClick: () => navigate("/login"),
          className: "btn bg-red-700 hover:bg-blue-700 text-white",
        },
        /*#__PURE__*/ React.createElement(Key, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        " Go to Login",
      ),
    );
  }
  return /*#__PURE__*/ React.createElement(
    AuthGuard,
    null,
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "relative min-h-screen overflow-hidden",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "absolute inset-0",
        },
        /*#__PURE__*/ React.createElement("div", {
          className:
            "absolute inset-0 bg-gradient-to-br from-black/95 via-neutral-900/90 to-black/95 z-10",
        }),
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            className: "absolute inset-0 opacity-20",
            initial: {
              scale: 1.1,
            },
            animate: {
              scale: 1,
            },
            transition: {
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            },
          },
          /*#__PURE__*/ React.createElement("img", {
            src: GymBg1,
            alt: "Gym Background",
            className: "w-full h-full object-cover",
          }),
        ),
        /*#__PURE__*/ React.createElement("div", {
          className:
            "absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-cyan-900/10 z-20",
        }),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "relative z-30 max-w-7xl mx-auto px-4 py-8",
        },
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            className: "text-center mb-12",
            initial: {
              opacity: 0,
              y: 30,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            transition: {
              duration: 0.8,
            },
          },
          /*#__PURE__*/ React.createElement(
            motion.h1,
            {
              className:
                "text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent",
              style: {
                fontFamily: "var(--font-heading)",
              },
              initial: {
                scale: 0.8,
              },
              animate: {
                scale: 1,
              },
              transition: {
                duration: 0.8,
                delay: 0.2,
              },
            },
            /*#__PURE__*/ React.createElement(BicepsFlexed, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " MY PROFILE",
          ),
          /*#__PURE__*/ React.createElement(
            motion.div,
            {
              className:
                "flex flex-wrap items-center justify-center gap-4 mb-6",
              initial: {
                opacity: 0,
              },
              animate: {
                opacity: 1,
              },
              transition: {
                delay: 0.5,
              },
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: `px-6 py-3 rounded-full border-2 backdrop-blur-sm ${isOnline ? "bg-red-600/20 text-green-300 border-red-500 shadow-lg shadow-red-600/25" : "bg-yellow-500/20 text-yellow-300 border-yellow-400 shadow-lg shadow-yellow-500/25"}`,
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "font-bold text-lg",
                },
                isOnline ? <><Flame className="w-[1em] h-[1em] inline-block"/> LIVE SYNC ACTIVE</> : <><Zap className="w-[1em] h-[1em] inline-block"/> OFFLINE MODE</>,
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: fetchProfileData,
                disabled: loading,
                className:
                  "px-6 py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-full shadow-lg shadow-red-600/25 transition-all duration-300 disabled:opacity-50",
              },
              loading ? <><RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> SYNCING...</> : <><RefreshCw className="w-[1em] h-[1em] inline-block"/> REFRESH</>,
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: handleLogout,
                className:
                  "px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-full shadow-lg shadow-red-500/25 transition-all duration-300",
              },
              /*#__PURE__*/ React.createElement(DoorOpen, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " LOGOUT",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            motion.p,
            {
              className: "text-neutral-300 text-lg max-w-2xl mx-auto",
              initial: {
                opacity: 0,
              },
              animate: {
                opacity: 1,
              },
              transition: {
                delay: 0.7,
              },
            },
            /*#__PURE__*/ React.createElement(Dumbbell, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Professional Gym Tracker \u2022 ",
            /*#__PURE__*/ React.createElement(Save, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " MongoDB Database \u2022 ",
            /*#__PURE__*/ React.createElement(RefreshCw, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Cross-Device Sync",
            lastSync &&
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "block text-sm text-neutral-400 mt-2",
                },
                "Last sync: ",
                lastSync.toLocaleTimeString(),
              ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12",
          },
          /*#__PURE__*/ React.createElement(
            motion.div,
            {
              className: "lg:col-span-1",
              initial: {
                opacity: 0,
                x: -30,
              },
              animate: {
                opacity: 1,
                x: 0,
              },
              transition: {
                duration: 0.8,
                delay: 0.3,
              },
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-xl border border-neutral-800/50 shadow-2xl shadow-black/50",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "absolute inset-0 opacity-10",
                },
                /*#__PURE__*/ React.createElement("img", {
                  src: ArnoldBg,
                  alt: "",
                  className: "w-full h-full object-cover",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "relative z-10 p-8",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-3 mb-6",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className: "w-3 h-3 bg-red-500 rounded-full animate-pulse",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "h2",
                    {
                      className: "text-2xl font-black text-white",
                      style: {
                        fontFamily: "var(--font-heading)",
                      },
                    },
                    /*#__PURE__*/ React.createElement(Image, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " PROFILE PICTURE",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "px-3 py-1 bg-red-600/20 text-red-500 text-xs font-bold rounded-full border border-red-600/30",
                    },
                    "CLOUDINARY",
                  ),
                ),
                /*#__PURE__*/ React.createElement(ImageUploader, {
                  currentImage: user?.profileImage,
                  onImageUpdate: handleImageUpdate,
                }),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "mt-6 p-4 bg-gradient-to-r from-neutral-900/50 to-neutral-800/50 rounded-2xl border border-neutral-700/30",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "flex items-center gap-2 text-red-500 text-sm mb-2",
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      className:
                        "w-2 h-2 bg-red-500 rounded-full animate-pulse",
                    }),
                    "Cross-device sync enabled",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-center gap-2 text-red-500 text-sm",
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      className: "w-2 h-2 bg-red-500 rounded-full",
                    }),
                    "Stored securely in cloud",
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            motion.div,
            {
              className: "lg:col-span-2",
              initial: {
                opacity: 0,
                x: 30,
              },
              animate: {
                opacity: 1,
                x: 0,
              },
              transition: {
                duration: 0.8,
                delay: 0.4,
              },
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-xl border border-neutral-800/50 shadow-2xl shadow-black/50",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "absolute inset-0 opacity-10",
                },
                /*#__PURE__*/ React.createElement("img", {
                  src: ChrisBg,
                  alt: "",
                  className: "w-full h-full object-cover",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "relative z-10 p-8",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center justify-between mb-8",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-center gap-3",
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      className:
                        "w-3 h-3 bg-orange-500 rounded-full animate-pulse",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "h2",
                      {
                        className: "text-2xl font-black text-white",
                        style: {
                          fontFamily: "var(--font-heading)",
                        },
                      },
                      /*#__PURE__*/ React.createElement(Edit, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " PROFILE INFORMATION",
                    ),
                    user?.synced === false &&
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30",
                        },
                        "PENDING SYNC",
                      ),
                  ),
                  !editing &&
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => setEditing(true),
                        className:
                          "px-6 py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-full shadow-lg transition-all duration-300",
                      },
                      /*#__PURE__*/ React.createElement(Pencil, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " EDIT",
                    ),
                ),
                editing
                  ? /*#__PURE__*/ React.createElement(
                      "form",
                      {
                        onSubmit: handleSaveProfile,
                        className: "space-y-6",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        null,
                        /*#__PURE__*/ React.createElement(
                          "label",
                          {
                            className:
                              "block text-sm font-bold text-neutral-300 mb-3 uppercase tracking-wider",
                          },
                          "Full Name",
                        ),
                        /*#__PURE__*/ React.createElement("input", {
                          type: "text",
                          name: "name",
                          value: formData.name,
                          onChange: handleInputChange,
                          className:
                            "w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300",
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
                              "block text-sm font-bold text-neutral-300 mb-3 uppercase tracking-wider",
                          },
                          "Email Address",
                        ),
                        /*#__PURE__*/ React.createElement("input", {
                          type: "email",
                          name: "email",
                          value: formData.email,
                          onChange: handleInputChange,
                          className:
                            "w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300",
                          required: true,
                        }),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex gap-4 pt-4",
                        },
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            type: "submit",
                            disabled: saving,
                            className:
                              "px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-red-600 hover:to-red-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 disabled:opacity-50",
                          },
                          saving ? <><RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> SAVING...</> : <><Save className="w-[1em] h-[1em] inline-block"/> SAVE CHANGES</>,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            type: "button",
                            onClick: () => {
                              setEditing(false);
                              setFormData({
                                name: user?.name || "",
                                email: user?.email || "",
                              });
                            },
                            className:
                              "px-8 py-3 bg-gradient-to-r from-neutral-700 to-neutral-800 hover:from-neutral-500 hover:to-neutral-700 text-white font-bold rounded-full shadow-lg transition-all duration-300",
                          },
                          "CANCEL",
                        ),
                      ),
                    )
                  : /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "space-y-4",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "label",
                            {
                              className:
                                "block text-sm font-bold text-neutral-400 mb-2 uppercase tracking-wider",
                            },
                            "Full Name",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "text-white text-xl font-semibold",
                            },
                            user?.name || "Not set",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "label",
                            {
                              className:
                                "block text-sm font-bold text-neutral-400 mb-2 uppercase tracking-wider",
                            },
                            "Email Address",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "text-white text-xl font-semibold",
                            },
                            user?.email || "Not set",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "label",
                            {
                              className:
                                "block text-sm font-bold text-neutral-400 mb-2 uppercase tracking-wider",
                            },
                            "Member Since",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "text-white font-semibold",
                            },
                            user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "Unknown",
                          ),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "space-y-4",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "label",
                            {
                              className:
                                "block text-sm font-bold text-neutral-400 mb-2 uppercase tracking-wider",
                            },
                            "Account Status",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "flex items-center gap-3",
                            },
                            /*#__PURE__*/ React.createElement("div", {
                              className:
                                "w-3 h-3 bg-red-500 rounded-full animate-pulse",
                            }),
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "text-red-500 font-bold",
                              },
                              "Active \u2022 Real-time Sync Enabled",
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
                                "block text-sm font-bold text-neutral-400 mb-2 uppercase tracking-wider",
                            },
                            "Data Storage",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "text-white font-semibold text-sm",
                            },
                            /*#__PURE__*/ React.createElement(BarChart3, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " MongoDB Database \u2022 ",
                            /*#__PURE__*/ React.createElement(Cloud, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " Cloudinary Images \u2022 ",
                            /*#__PURE__*/ React.createElement(RefreshCw, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " Cross-device Sync",
                          ),
                        ),
                      ),
                    ),
              ),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            className: "mb-12",
            initial: {
              opacity: 0,
              y: 30,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            transition: {
              duration: 0.8,
              delay: 0.5,
            },
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-xl border border-neutral-800/50 shadow-2xl shadow-black/50",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "absolute inset-0 opacity-5",
              },
              /*#__PURE__*/ React.createElement("img", {
                src: GymBg2,
                alt: "",
                className: "w-full h-full object-cover",
              }),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "relative z-10 p-8",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center justify-between mb-8",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-3",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className: "w-3 h-3 bg-red-700 rounded-full animate-pulse",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "h2",
                    {
                      className: "text-3xl font-black text-white",
                      style: {
                        fontFamily: "var(--font-heading)",
                      },
                    },
                    /*#__PURE__*/ React.createElement(BarChart3, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " YOUR PROGRESS",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: `px-4 py-2 rounded-full border-2 ${stats?.isRealTime ? "bg-red-600/20 text-red-500 border-red-500 animate-pulse" : "bg-yellow-500/20 text-yellow-400 border-yellow-400"}`,
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "font-bold text-sm",
                      },
                      stats?.isRealTime ? "LIVE DATA" : "CACHED",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-neutral-400 text-sm",
                  },
                  stats?.lastSync
                    ? `Updated: ${new Date(stats.lastSync).toLocaleTimeString()}`
                    : "Loading...",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "grid grid-cols-2 md:grid-cols-4 gap-6 mb-8",
                },
                /*#__PURE__*/ React.createElement(
                  motion.div,
                  {
                    className:
                      "relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-700/20 to-blue-800/20 border border-red-600/30 p-6 hover:scale-105 transition-transform duration-300",
                    whileHover: {
                      scale: 1.05,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-4xl font-black text-red-500 mb-2",
                      },
                      stats?.totalWorkouts || 0,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-sm text-neutral-300 font-bold uppercase tracking-wider",
                      },
                      "Total Workouts",
                    ),
                    stats?.totalWorkouts > 0 &&
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-xs text-blue-300 mt-2 font-semibold",
                        },
                        /*#__PURE__*/ React.createElement(BicepsFlexed, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                        " ",
                        stats?.averageWorkoutDuration || 0,
                        "min avg",
                      ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  motion.div,
                  {
                    className:
                      "relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-red-600/30 p-6 hover:scale-105 transition-transform duration-300",
                    whileHover: {
                      scale: 1.05,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-4xl font-black text-red-500 mb-2",
                      },
                      stats?.totalMeals || 0,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-sm text-neutral-300 font-bold uppercase tracking-wider",
                      },
                      "Meals Logged",
                    ),
                    stats?.totalMeals > 0 &&
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-xs text-green-300 mt-2 font-semibold",
                        },
                        /*#__PURE__*/ React.createElement(Utensils, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                        " Nutrition tracked",
                      ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  motion.div,
                  {
                    className:
                      "relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-800/20 to-purple-800/20 border border-red-700/30 p-6 hover:scale-105 transition-transform duration-300",
                    whileHover: {
                      scale: 1.05,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-4xl font-black text-red-600 mb-2",
                      },
                      stats?.xpPoints || 0,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-sm text-neutral-300 font-bold uppercase tracking-wider",
                      },
                      "XP Points",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-xs text-purple-300 mt-2 font-semibold",
                      },
                      "Level ",
                      Math.floor((stats?.xpPoints || 0) / 1000) + 1,
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  motion.div,
                  {
                    className:
                      "relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 p-6 hover:scale-105 transition-transform duration-300",
                    whileHover: {
                      scale: 1.05,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-4xl font-black text-orange-400 mb-2",
                      },
                      stats?.currentStreak || 0,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-sm text-neutral-300 font-bold uppercase tracking-wider",
                      },
                      "Day Streak",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-xs text-orange-300 mt-2 font-semibold",
                      },
                      stats?.currentStreak >= 7
                        ? "🔥 On Fire!"
                        : stats?.currentStreak > 0
                          ? "💪 Keep Going!"
                          : "🎯 Start Today!",
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-8",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-center p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/50",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-2xl font-black text-red-400 mb-1",
                    },
                    stats?.totalCaloriesBurned || 0,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-xs text-neutral-400 font-bold uppercase tracking-wider",
                    },
                    "Calories Burned",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-center p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/50",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-2xl font-black text-red-500 mb-1",
                    },
                    stats?.totalPlans || 0,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-xs text-neutral-400 font-bold uppercase tracking-wider",
                    },
                    "Workout Plans",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-center p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/50",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-2xl font-black text-yellow-400 mb-1",
                    },
                    stats?.membershipDays || 0,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-xs text-neutral-400 font-bold uppercase tracking-wider",
                    },
                    "Days Member",
                  ),
                ),
              ),
              !stats?.totalWorkouts &&
                !stats?.totalMeals &&
                /*#__PURE__*/ React.createElement(
                  motion.div,
                  {
                    className:
                      "text-center py-12 border-2 border-dashed border-neutral-700 rounded-2xl bg-neutral-900/30",
                    initial: {
                      opacity: 0,
                    },
                    animate: {
                      opacity: 1,
                    },
                    transition: {
                      delay: 0.5,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-6xl mb-4",
                    },
                    /*#__PURE__*/ React.createElement(Rocket, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "h3",
                    {
                      className: "text-2xl font-black text-white mb-4",
                      style: {
                        fontFamily: "var(--font-heading)",
                      },
                    },
                    "START YOUR FITNESS JOURNEY!",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className: "text-neutral-400 mb-6 text-lg",
                    },
                    "Complete your first workout or log a meal to see real-time progress here.",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex gap-4 justify-center flex-wrap",
                    },
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => navigate("/library"),
                        className:
                          "px-8 py-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-full shadow-lg transition-all duration-300",
                      },
                      /*#__PURE__*/ React.createElement(Dumbbell, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " START WORKOUT",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => navigate("/nutrition"),
                        className:
                          "px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-red-600 hover:to-red-600 text-white font-bold rounded-full shadow-lg transition-all duration-300",
                      },
                      /*#__PURE__*/ React.createElement(Apple, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " LOG MEAL",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => navigate("/my-plans"),
                        className:
                          "px-8 py-4 bg-gradient-to-r from-red-800 to-pink-600 hover:from-red-700 hover:to-pink-500 text-white font-bold rounded-full shadow-lg transition-all duration-300",
                      },
                      /*#__PURE__*/ React.createElement(ClipboardList, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " CREATE PLAN",
                    ),
                  ),
                ),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            className: "mb-12",
            initial: {
              opacity: 0,
              y: 30,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            transition: {
              duration: 0.8,
              delay: 0.6,
            },
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-xl border border-neutral-800/50 shadow-2xl shadow-black/50",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "relative z-10 p-8",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-3 mb-8",
                },
                /*#__PURE__*/ React.createElement("div", {
                  className: "w-3 h-3 bg-red-600 rounded-full animate-pulse",
                }),
                /*#__PURE__*/ React.createElement(
                  "h2",
                  {
                    className: "text-3xl font-black text-white",
                    style: {
                      fontFamily: "var(--font-heading)",
                    },
                  },
                  /*#__PURE__*/ React.createElement(Zap, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " QUICK ACTIONS",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "grid grid-cols-2 md:grid-cols-4 gap-6",
                },
                /*#__PURE__*/ React.createElement(
                  motion.button,
                  {
                    onClick: () => navigate("/my-plans"),
                    className:
                      "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-700/20 to-blue-800/20 border border-red-600/30 p-8 hover:scale-105 transition-all duration-300",
                    whileHover: {
                      scale: 1.05,
                    },
                    whileTap: {
                      scale: 0.95,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-4xl mb-4 group-hover:scale-110 transition-transform duration-300",
                      },
                      /*#__PURE__*/ React.createElement(ClipboardList, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-white font-bold text-lg",
                      },
                      "MY PLANS",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  motion.button,
                  {
                    onClick: () => navigate("/analytics"),
                    className:
                      "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-800/20 to-purple-800/20 border border-red-700/30 p-8 hover:scale-105 transition-all duration-300",
                    whileHover: {
                      scale: 1.05,
                    },
                    whileTap: {
                      scale: 0.95,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-4xl mb-4 group-hover:scale-110 transition-transform duration-300",
                      },
                      /*#__PURE__*/ React.createElement(BarChart3, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-white font-bold text-lg",
                      },
                      "ANALYTICS",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  motion.button,
                  {
                    onClick: () => navigate("/nutrition"),
                    className:
                      "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-red-600/30 p-8 hover:scale-105 transition-all duration-300",
                    whileHover: {
                      scale: 1.05,
                    },
                    whileTap: {
                      scale: 0.95,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-4xl mb-4 group-hover:scale-110 transition-transform duration-300",
                      },
                      /*#__PURE__*/ React.createElement(Apple, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-white font-bold text-lg",
                      },
                      "NUTRITION",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  motion.button,
                  {
                    onClick: () => navigate("/library"),
                    className:
                      "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 p-8 hover:scale-105 transition-all duration-300",
                    whileHover: {
                      scale: 1.05,
                    },
                    whileTap: {
                      scale: 0.95,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-4xl mb-4 group-hover:scale-110 transition-transform duration-300",
                      },
                      /*#__PURE__*/ React.createElement(Book, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-white font-bold text-lg",
                      },
                      "EXERCISES",
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        activity.length > 0 &&
          /*#__PURE__*/ React.createElement(
            motion.div,
            {
              className: "mb-12",
              initial: {
                opacity: 0,
                y: 30,
              },
              animate: {
                opacity: 1,
                y: 0,
              },
              transition: {
                duration: 0.8,
                delay: 0.7,
              },
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-xl border border-neutral-800/50 shadow-2xl shadow-black/50",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "relative z-10 p-8",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-3 mb-8",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className: "w-3 h-3 bg-red-600 rounded-full animate-pulse",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "h2",
                    {
                      className: "text-3xl font-black text-white",
                      style: {
                        fontFamily: "var(--font-heading)",
                      },
                    },
                    /*#__PURE__*/ React.createElement(TrendingUp, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " RECENT ACTIVITY",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "px-4 py-2 bg-red-600/20 text-red-500 text-sm font-bold rounded-full border border-red-600/30",
                    },
                    activity.length,
                    " ITEMS",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "space-y-4 max-h-80 overflow-y-auto",
                  },
                  activity.slice(0, 8).map((item, index) =>
                    /*#__PURE__*/ React.createElement(
                      motion.div,
                      {
                        key: item.id,
                        className:
                          "flex items-center gap-4 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/50 hover:bg-neutral-900/70 transition-colors",
                        initial: {
                          opacity: 0,
                          x: -20,
                        },
                        animate: {
                          opacity: 1,
                          x: 0,
                        },
                        transition: {
                          delay: index * 0.1,
                        },
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-3xl",
                        },
                        item.icon,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex-1",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "text-white font-bold text-lg",
                          },
                          item.title,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "text-neutral-400",
                          },
                          item.description,
                        ),
                        item.details &&
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "text-xs text-neutral-500 mt-1",
                            },
                            Object.values(item.details)
                              .filter(Boolean)
                              .join(" • "),
                          ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-xs text-neutral-500 font-semibold",
                        },
                        new Date(item.timestamp).toLocaleDateString(),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        achievements.length > 0 &&
          /*#__PURE__*/ React.createElement(
            motion.div,
            {
              className: "mb-12",
              initial: {
                opacity: 0,
                y: 30,
              },
              animate: {
                opacity: 1,
                y: 0,
              },
              transition: {
                duration: 0.8,
                delay: 0.8,
              },
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-xl border border-neutral-800/50 shadow-2xl shadow-black/50",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "relative z-10 p-8",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-3 mb-8",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className:
                      "w-3 h-3 bg-yellow-500 rounded-full animate-pulse",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "h2",
                    {
                      className: "text-3xl font-black text-white",
                      style: {
                        fontFamily: "var(--font-heading)",
                      },
                    },
                    /*#__PURE__*/ React.createElement(Trophy, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " ACHIEVEMENTS",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "px-4 py-2 bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-full border border-yellow-500/30",
                    },
                    achievements.length,
                    " UNLOCKED",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                  },
                  achievements.slice(0, 6).map((achievement, index) =>
                    /*#__PURE__*/ React.createElement(
                      motion.div,
                      {
                        key: achievement.id,
                        className:
                          "relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 p-6",
                        initial: {
                          opacity: 0,
                          scale: 0.9,
                        },
                        animate: {
                          opacity: 1,
                          scale: 1,
                        },
                        transition: {
                          delay: index * 0.1,
                        },
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-center",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "text-4xl mb-4",
                          },
                          achievement.icon,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "text-white font-bold text-lg mb-2",
                          },
                          achievement.title,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "text-neutral-400 text-sm mb-3",
                          },
                          achievement.description,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "text-xs text-yellow-400 font-semibold",
                          },
                          "Unlocked ",
                          new Date(achievement.unlockedAt).toLocaleDateString(),
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
  );
};
export default Profile;

// Enhanced Profile Features:
// ✅ Modern gym-themed UI with dynamic backgrounds
// ✅ Preserved all MongoDB integration and real-time functionality
// ✅ Enhanced visual hierarchy with gradient cards
// ✅ Improved typography with gym vibes
// ✅ Better responsive design
// ✅ Animated elements and hover effects
// ✅ Professional gym tracker appearance
// ✅ All original functionality maintained
