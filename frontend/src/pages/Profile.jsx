// frontend/src/pages/Profile.jsx - ENHANCED GYM-THEMED PROFILE v2.0
import { Star, BicepsFlexed, Dumbbell, Utensils, ClipboardList, CheckCircle2, XCircle, AlertTriangle, RefreshCw, DoorOpen, User, Key, Zap, Image, Edit, Pencil, Save, BarChart3, Cloud, TrendingUp, Flame } from 'lucide-react';
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ImageUploader from "../components/ImageUploader";
import AuthGuard from "../components/AuthGuard";
import api from "../utils/api";
import BodyMetricsLogger from "../components/BodyMetricsLogger";
import AchievementsPreview from "../components/AchievementsPreview";

// Import gym-themed background images
import GymBg1 from "../assets/wp8463825-male-workout-wallpapers.jpg";
import GymBg2 from "../assets/woman-gym-body-building.jpg";
import ArnoldBg from "../assets/Arnold Schwarzenegge1.jpg";
import ChrisBg from "../assets/ChrisBumstead1.jpg";


const Profile = () => {
  // Initialize user from localStorage immediately to prevent flash
  const [user, setUser] = useState(() => {
    try {
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      return localUser.name ? localUser : null;
    } catch {
      return null;
    }
  });
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState(() => {
    try {
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        name: localUser.name || "",
        email: localUser.email || "",
      };
    } catch {
      return {
        name: "",
        email: "",
      };
    }
  });
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);

  // Force browser refresh - ENHANCED PROFILE LOADED
  console.log("🔥 ENHANCED GYM PROFILE v2.0 LOADED - NEW UI ACTIVE! 💪");

  // Real-time data fetching
  const fetchProfileData = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch all profile data in parallel
      const [profileRes, statsRes, activityRes] = await Promise.allSettled([
        api.get("/users/profile"),
        api.get("/users/stats"),
        api.get("/users/activity"),
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
      // No loading state change needed
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

  // Handle escape key to close photo viewer
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showPhotoViewer) {
        setShowPhotoViewer(false);
      }
    };
    if (showPhotoViewer) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showPhotoViewer]);
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

  // Only show "Profile Not Found" if no user exists
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
          className:
            "relative z-30 max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8",
        },
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            className: "text-center mb-6 sm:mb-8 lg:mb-12",
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
                "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent leading-tight px-2",
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
                "flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6 px-2",
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
                className: `px-3 sm:px-4 py-2 rounded-full border-2 backdrop-blur-sm text-center w-full sm:w-auto ${isOnline ? "bg-red-600/20 text-green-300 border-red-500 shadow-lg shadow-red-600/25" : "bg-yellow-500/20 text-yellow-300 border-yellow-400 shadow-lg shadow-yellow-500/25"}`,
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "font-bold text-sm sm:text-base",
                },
                isOnline ? <><Flame className="w-[1em] h-[1em] inline-block"/> LIVE SYNC</> : <><Zap className="w-[1em] h-[1em] inline-block"/> OFFLINE</>,
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex gap-2 w-full sm:w-auto",
              },
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: fetchProfileData,
                  className:
                    "flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-full shadow-lg shadow-red-600/25 transition-all duration-300 text-sm",
                },
                /*#__PURE__*/ React.createElement(RefreshCw, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " REFRESH",
              ),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: handleLogout,
                  className:
                    "flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-full shadow-lg shadow-red-500/25 transition-all duration-300 text-sm",
                },
                /*#__PURE__*/ React.createElement(DoorOpen, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " LOGOUT",
              ),
            ),
          ),
          lastSync &&
            /*#__PURE__*/ React.createElement(
              motion.p,
              {
                className: "text-neutral-400 text-xs max-w-2xl mx-auto px-3",
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
              "Last sync: ",
              lastSync.toLocaleTimeString(),
            ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-12",
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
                  className: "relative z-10 p-3 sm:p-4 lg:p-6",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3 sm:mb-4",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-center gap-2",
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      className:
                        "w-2 h-2 bg-red-500 rounded-full animate-pulse",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "h2",
                      {
                        className:
                          "text-base sm:text-lg lg:text-xl font-black text-white",
                        style: {
                          fontFamily: "var(--font-heading)",
                        },
                      },
                      /*#__PURE__*/ React.createElement(Image, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " PROFILE PICTURE",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "px-2 py-1 bg-red-600/20 text-red-500 text-xs font-bold rounded-full border border-red-600/30",
                    },
                    "CLOUDINARY",
                  ),
                ),
                /*#__PURE__*/ React.createElement(ImageUploader, {
                  currentImage: user?.profileImage,
                  onImageUpdate: handleImageUpdate,
                  onImageClick: () =>
                    user?.profileImage && setShowPhotoViewer(true),
                }),
                /*#__PURE__*/ React.createElement("input", {
                  ref: fileInputRef,
                  type: "file",
                  accept: "image/*",
                  onChange: async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // Reset file input
                    e.target.value = "";
                    if (!file.type.startsWith("image/")) {
                      alert("Please select an image file");
                      return;
                    }
                    if (file.size > 5242880) {
                      alert(
                        `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`,
                      );
                      return;
                    }
                    setUploadingPhoto(true);

                    // Convert to base64 and update
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      const imageUrl = event.target.result;
                      await handleImageUpdate(imageUrl);
                      setTimeout(() => setUploadingPhoto(false), 800);
                    };
                    reader.readAsDataURL(file);
                  },
                  className: "hidden",
                }),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "mt-3 sm:mt-4 p-3 bg-gradient-to-r from-neutral-900/50 to-neutral-800/50 rounded-lg sm:rounded-xl border border-neutral-700/30",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "flex items-center gap-2 text-red-500 text-xs mb-2",
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      className:
                        "w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      "Cross-device sync enabled",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-center gap-2 text-red-500 text-xs",
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      className: "w-1.5 h-1.5 bg-red-500 rounded-full",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      "Stored securely in cloud",
                    ),
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
                  className: "relative z-10 p-3 sm:p-4 lg:p-6",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "flex flex-col sm:flex-row items-start sm:items-center gap-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "flex items-center gap-2",
                      },
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "w-2 h-2 bg-orange-500 rounded-full animate-pulse",
                      }),
                      /*#__PURE__*/ React.createElement(
                        "h2",
                        {
                          className:
                            "text-base sm:text-lg lg:text-xl font-black text-white",
                          style: {
                            fontFamily: "var(--font-heading)",
                          },
                        },
                        /*#__PURE__*/ React.createElement(Edit, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                        " PROFILE INFO",
                      ),
                    ),
                    user?.synced === false &&
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30",
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
                          "w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 text-sm",
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
                          className:
                            "flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4",
                        },
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            type: "submit",
                            disabled: saving,
                            className:
                              "px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-red-600 hover:to-red-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 text-sm sm:text-base",
                          },
                          saving ? <><RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> SAVING...</> : <><Save className="w-[1em] h-[1em] inline-block"/> SAVE</>,
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
                              "px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-gradient-to-r from-neutral-700 to-neutral-800 hover:from-neutral-500 hover:to-neutral-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 text-sm sm:text-base",
                          },
                          "CANCEL",
                        ),
                      ),
                    )
                  : /*#__PURE__*/ React.createElement(
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
                              "block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider",
                          },
                          "Full Name",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-white text-base sm:text-lg font-semibold break-words",
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
                              "block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider",
                          },
                          "Email Address",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-white text-sm sm:text-base font-semibold break-all",
                          },
                          user?.email || "Not set",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "label",
                            {
                              className:
                                "block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider",
                            },
                            "Member Since",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "text-white text-sm font-semibold",
                            },
                            user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "Unknown",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "label",
                            {
                              className:
                                "block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider",
                            },
                            "Account Status",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "flex items-center gap-2",
                            },
                            /*#__PURE__*/ React.createElement("div", {
                              className:
                                "w-2 h-2 bg-red-500 rounded-full animate-pulse",
                            }),
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className:
                                  "text-red-500 font-bold text-xs sm:text-sm",
                              },
                              "Active \u2022 Real-time Sync",
                            ),
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
                              "block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider",
                          },
                          "Data Storage",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-white font-semibold text-xs leading-relaxed",
                          },
                          /*#__PURE__*/ React.createElement(BarChart3, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " Cloud Database \u2022 ",
                          /*#__PURE__*/ React.createElement(Cloud, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " Cloudinary \u2022 ",
                          /*#__PURE__*/ React.createElement(RefreshCw, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " Cross-device",
                        ),
                      ),
                    ),
              ),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          motion.div,
          { className: "mb-8", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
          /*#__PURE__*/ React.createElement(BodyMetricsLogger, {
            showSummary: true,
            initialWeight: user?.metrics?.currentWeight,
            initialBodyFat: user?.metrics?.bodyFatPercentage,
            height: user?.metrics?.height,
            onSaved: (metric) => setUser((current) => ({
              ...current,
              metrics: { ...current?.metrics, currentWeight: metric.weight, bodyFatPercentage: metric.bodyFatPercentage ?? current?.metrics?.bodyFatPercentage }
            }))
          }),
        ),
        /*#__PURE__*/ React.createElement(
          motion.div,
          { className: "mb-8", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
          /*#__PURE__*/ React.createElement(AchievementsPreview, null),
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
                  className: "relative z-10 p-4 sm:p-6 lg:p-8",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-6 sm:mb-8",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-center gap-2 sm:gap-3",
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      className:
                        "w-2 h-2 sm:w-3 sm:h-3 bg-red-600 rounded-full animate-pulse",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "h2",
                      {
                        className:
                          "text-xl sm:text-2xl lg:text-3xl font-black text-white",
                        style: {
                          fontFamily: "var(--font-heading)",
                        },
                      },
                      /*#__PURE__*/ React.createElement(TrendingUp, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " RECENT ACTIVITY",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "px-2 sm:px-3 lg:px-4 py-1 sm:py-2 bg-red-600/20 text-red-500 text-xs sm:text-sm font-bold rounded-full border border-red-600/30",
                    },
                    activity.length,
                    " ITEMS",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-y-auto",
                  },
                  activity.slice(0, 8).map((item, index) =>
                    /*#__PURE__*/ React.createElement(
                      motion.div,
                      {
                        key: item.id,
                        className:
                          "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-neutral-900/50 rounded-lg sm:rounded-xl border border-neutral-800/50 hover:bg-neutral-900/70 transition-colors",
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
                          className:
                            "text-xl sm:text-2xl lg:text-3xl flex-shrink-0",
                        },
                        item.icon,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex-1 min-w-0",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-white font-bold text-sm sm:text-base lg:text-lg truncate",
                          },
                          item.title,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-neutral-400 text-xs sm:text-sm truncate",
                          },
                          item.description,
                        ),
                        item.details &&
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "text-xs text-neutral-500 mt-1 truncate",
                            },
                            Object.values(item.details)
                              .filter(Boolean)
                              .join(" • "),
                          ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-xs text-neutral-500 font-semibold flex-shrink-0",
                        },
                        new Date(item.timestamp).toLocaleDateString(),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
      ),
    ),
    uploadingPhoto &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-neutral-900 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl border border-neutral-700",
          },
          /*#__PURE__*/ React.createElement("div", {
            className:
              "w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin",
          }),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-white font-bold text-sm",
            },
            "Updating Photo...",
          ),
        ),
      ),
    showPhotoViewer &&
      user?.profileImage &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "fixed inset-0 bg-black/95 backdrop-blur-sm z-[9998] flex items-center justify-center p-4",
          onClick: (e) => {
            if (e.target === e.currentTarget) {
              setShowPhotoViewer(false);
            }
          },
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "absolute top-4 left-4 right-4 z-[9999] flex justify-between items-center pointer-events-none",
          },
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPhotoViewer(false);
              },
              className:
                "bg-black/70 text-white rounded-full p-4 min-w-[48px] min-h-[48px] flex items-center justify-center pointer-events-auto select-none",
              style: {
                touchAction: "manipulation",
              },
            },
            /*#__PURE__*/ React.createElement(
              "svg",
              {
                className: "w-6 h-6",
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
          ),
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!uploadingPhoto) {
                  setShowPhotoViewer(false);
                  setTimeout(() => {
                    fileInputRef.current?.click();
                  }, 100);
                }
              },
              className:
                "bg-black/70 text-white rounded-full p-4 min-w-[48px] min-h-[48px] flex items-center justify-center pointer-events-auto select-none",
              style: {
                touchAction: "manipulation",
              },
            },
            /*#__PURE__*/ React.createElement(
              "svg",
              {
                className: "w-6 h-6",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
              },
              /*#__PURE__*/ React.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
              }),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "relative max-w-4xl max-h-full w-full h-full flex items-center justify-center",
            onClick: (e) => e.stopPropagation(),
          },
          /*#__PURE__*/ React.createElement("img", {
            src: user.profileImage,
            alt: "Profile Picture",
            className:
              "max-w-full max-h-full object-contain rounded-2xl shadow-2xl",
            style: {
              maxHeight: "90vh",
              maxWidth: "90vw",
            },
          }),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center justify-between text-white",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                null,
                /*#__PURE__*/ React.createElement(
                  "h3",
                  {
                    className: "font-bold text-lg",
                  },
                  user.name || "Profile Picture",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!uploadingPhoto) {
                      setShowPhotoViewer(false);
                      setTimeout(() => {
                        fileInputRef.current?.click();
                      }, 100);
                    }
                  },
                  className:
                    "bg-red-700 text-white px-4 py-3 rounded-full text-sm font-bold flex items-center gap-2 min-h-[44px] select-none",
                  style: {
                    touchAction: "manipulation",
                  },
                },
                /*#__PURE__*/ React.createElement(
                  "svg",
                  {
                    className: "w-4 h-4",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                  },
                  /*#__PURE__*/ React.createElement("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                  }),
                ),
                "Change Photo",
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
