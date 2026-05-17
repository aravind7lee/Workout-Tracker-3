import { User, Bell, Shield, Palette, Database, HelpCircle, Save, Target, Globe, Moon, Sun, Smartphone, Mail, Activity, Trophy, Zap, BarChart3, Calendar, Clock, CheckCircle2, AlertTriangle, Timer, XCircle, Rocket, Dumbbell, Utensils, ClipboardList, RefreshCw, PartyPopper, Star, Sparkles, BicepsFlexed, Plug, Scale, TrendingUp, Armchair, Footprints, Apple, Flag, Settings as SettingsIcon, Sliders, Flame } from 'lucide-react';
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import settingsService from "../services/settingsService";
import chromeErrorHandler from "../utils/chromeErrorHandler";
import { onlineService } from "../services/onlineService";


export default function Settings() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState("ready");
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    totalWorkouts: 0,
    totalMeals: 0,
    totalPlans: 0,
    membershipDays: 0,
    lastSync: null,
  });
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
    },
    fitnessGoals: {
      goal: user?.fitnessGoals?.goal || "maintain",
      activityLevel: user?.fitnessGoals?.activityLevel || "moderate",
      targetWeight: user?.fitnessGoals?.targetWeight || null,
      weeklyGoal: user?.fitnessGoals?.weeklyGoal || 3,
    },
    notifications: {
      emailNotifications: user?.notifications?.emailNotifications ?? true,
      pushNotifications: user?.notifications?.pushNotifications ?? true,
      workoutReminders: user?.notifications?.workoutReminders ?? true,
      mealReminders: user?.notifications?.mealReminders ?? false,
    },
    privacy: {
      profileVisibility: user?.privacy?.profileVisibility || "public",
      dataSharing: user?.privacy?.dataSharing || false,
      analyticsOptOut: user?.privacy?.analyticsOptOut || false,
    },
    preferences: {
      theme: "dark",
      language: user?.preferences?.language || "en",
      units: user?.preferences?.units || "metric",
      dateFormat: user?.preferences?.dateFormat || "MM/DD/YYYY",
      timeFormat: user?.preferences?.timeFormat || "12h",
    },
    data: {
      autoBackup: user?.dataSettings?.autoBackup ?? true,
      syncAcrossDevices: user?.dataSettings?.syncAcrossDevices ?? true,
      dataRetention: user?.dataSettings?.dataRetention || "1year",
    },
  });
  const settingsTabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      color: "from-red-600 to-red-600",
    },
    {
      id: "fitness",
      label: "Fitness Goals",
      icon: Target,
      color: "from-red-600 to-red-600",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "privacy",
      label: "Privacy & Security",
      icon: Shield,
      color: "from-red-500 to-pink-500",
    },
    {
      id: "preferences",
      label: "App Preferences",
      icon: Palette,
      color: "from-red-700 to-violet-500",
    },
    {
      id: "data",
      label: "Data & Storage",
      icon: Database,
      color: "from-red-700 to-red-600",
    },
    {
      id: "help",
      label: "Help & Support",
      icon: HelpCircle,
      color: "from-gray-500 to-neutral-500",
    },
  ];
  const autoSave = useCallback(
    settingsService.setupAutoSave((result) => {
      setLastSyncResult(result);
      setSyncStatus(result.status || "error");
    }),
    [],
  );
  const loadRealTimeData = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const statsResponse = await fetch(
        `${import.meta.env.VITE_API_BASE}/users/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        },
      );
      clearTimeout(timeoutId);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setRealTimeStats({
          totalWorkouts: stats.totalWorkouts || 0,
          totalMeals: stats.totalMeals || 0,
          totalPlans: stats.totalPlans || 0,
          membershipDays: stats.membershipDays || 0,
          lastSync: new Date().toISOString(),
        });
        console.log("✅ Real-time stats loaded successfully");
      } else {
        console.warn("⚠️ Stats endpoint returned:", statsResponse.status);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("⏱️ Stats request timed out");
      } else {
        console.error("❌ Failed to load real-time data:", error.message);
      }
    }
  }, [isAuthenticated]);
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setSyncStatus("loading");
        console.log("🚀 FORCE LOAD FROM MONGODB - Global Sync Priority");
        const result = await chromeErrorHandler.safeExecuteAsync(async () => {
          return await settingsService.loadSettings();
        });
        if (result) {
          setSettings((prev) => ({
            ...prev,
            ...result.settings,
          }));
          setLastSyncResult(result);
          setSyncStatus(result.status);
          if (result.source === "mongodb") {
            console.log("✅ Settings loaded from server!");
          } else {
            console.warn("⚠️ Using fallback:", result.source);
          }
        }
        setTimeout(() => {
          loadRealTimeData();
        }, 1000);
      } catch (error) {
        console.error("❌ Error loading settings:", error);
        setSyncStatus("error");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
    const handleOnline = () => {
      chromeErrorHandler.safeExecute(() => {
        console.log("🌐 Network back online - FORCE MongoDB reconnection");
        setIsOnline(true);
        setSyncStatus("syncing");
        setTimeout(() => {
          loadSettings();
        }, 2000);
        setTimeout(() => {
          loadRealTimeData();
        }, 3000);
      });
    };
    const handleOffline = () => {
      chromeErrorHandler.safeExecute(() => {
        console.log("📱 Network offline - Local mode active");
        setIsOnline(false);
        setSyncStatus("offline");
      });
    };
    const handleWorkoutCompleted = () => {
      console.log("🏋️ Workout completed - refreshing real-time data");
      setTimeout(() => loadRealTimeData(), 1000);
    };
    const handleMealAdded = () => {
      console.log("🍽️ Meal added - refreshing real-time data");
      setTimeout(() => loadRealTimeData(), 1000);
    };
    const handlePlanCreated = () => {
      console.log("📋 Plan created - refreshing real-time data");
      setTimeout(() => loadRealTimeData(), 1000);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("workoutCompleted", handleWorkoutCompleted);
    window.addEventListener("mealAdded", handleMealAdded);
    window.addEventListener("planCreated", handlePlanCreated);
    const refreshInterval = setInterval(() => {
      if (isAuthenticated() && navigator.onLine && !loading) {
        loadRealTimeData();
      }
    }, 60000);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("workoutCompleted", handleWorkoutCompleted);
      window.removeEventListener("mealAdded", handleMealAdded);
      window.removeEventListener("planCreated", handlePlanCreated);
      clearInterval(refreshInterval);
    };
  }, [isAuthenticated, loadRealTimeData]);
  const handleSettingChange = useCallback((section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  }, []);
  useEffect(() => {
    if (
      Object.keys(settings).length > 0 &&
      settings.profile.name !== undefined &&
      !loading
    ) {
      console.log("🔄 Auto-save triggered");
      setSyncStatus("syncing");
      autoSave({
        ...settings,
        autoSaveTimestamp: new Date().toISOString(),
        globalSync: true,
      });
    }
  }, [settings, autoSave, loading]);
  const handleSave = async () => {
    setIsSaving(true);
    setSyncStatus("syncing");
    try {
      console.log("🚀 FORCE SAVE TO MONGODB - Global Sync Initiated");
      if (
        settings.profile.name !== user?.name ||
        settings.profile.email !== user?.email
      ) {
        updateUser({
          ...user,
          name: settings.profile.name,
          email: settings.profile.email,
        });
      }
      const result = await chromeErrorHandler.safeExecuteAsync(async () => {
        return await settingsService.saveSettings({
          ...settings,
          timestamp: new Date().toISOString(),
          deviceId: navigator.userAgent,
          globalSync: true,
        });
      });
      if (result) {
        setLastSyncResult(result);
        setSyncStatus(result.status);
        if (result.success) {
          if (result.source === "mongodb") {
            alert(
              "🎉 GLOBAL SETTINGS SAVED SUCCESSFULLY!\n\n✅ Saved to MongoDB Database\n🌐 Global Cloud Synchronization\n🎯 Fitness Goals Updated Globally\n🔔 Notifications Configured Worldwide\n📱 Available on ALL devices\n🏋️♂️ Professional Gym Experience\n🔥 Real-Time MongoDB Sync Active\n\n✨ Your preferences are LIVE globally!",
            );
          } else if (result.source === "local") {
            alert(
              "⚠️ SETTINGS SAVED LOCALLY\n\n💾 Saved to device storage\n🔄 Will sync to MongoDB when online\n🌐 Backend connection issue detected\n💪 Settings are ready to use\n\n🔌 Check your internet connection for global sync",
            );
          }
        } else {
          alert(
            "❌ SAVE FAILED\n\nPlease check:\n• Internet connection\n• Backend server status\n• Authentication token\n\nTry again in a moment.",
          );
        }
      } else {
        alert(
          "❌ CRITICAL ERROR\n\nSettings save completely failed.\nPlease refresh and try again.",
        );
        setSyncStatus("error");
      }
    } catch (error) {
      console.error("❌ Settings save failed:", error);
      alert(
        "❌ SAVE ERROR\n\n" +
          error.message +
          "\n\nPlease try again or check your connection.",
      );
      setSyncStatus("error");
    } finally {
      setIsSaving(false);
    }
  };
  const renderProfileSettings = () =>
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "space-y-4 sm:space-y-6",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(User, {
              size: 16,
            }),
            "Full Name",
          ),
          /*#__PURE__*/ React.createElement("input", {
            type: "text",
            value: settings.profile.name,
            onChange: (e) =>
              handleSettingChange("profile", "name", e.target.value),
            className:
              "w-full px-4 py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all",
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
                "block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(Mail, {
              size: 16,
            }),
            "Email Address",
          ),
          /*#__PURE__*/ React.createElement("input", {
            type: "email",
            value: settings.profile.email,
            onChange: (e) =>
              handleSettingChange("profile", "email", e.target.value),
            className:
              "w-full px-4 py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all",
            placeholder: "Enter your email",
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(Smartphone, {
              size: 16,
            }),
            "Phone Number",
          ),
          /*#__PURE__*/ React.createElement("input", {
            type: "tel",
            value: settings.profile.phone,
            onChange: (e) =>
              handleSettingChange("profile", "phone", e.target.value),
            placeholder: "+1 (555) 123-4567",
            className:
              "w-full px-4 py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all",
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(Globe, {
              size: 16,
            }),
            "Location",
          ),
          /*#__PURE__*/ React.createElement("input", {
            type: "text",
            value: settings.profile.location,
            onChange: (e) =>
              handleSettingChange("profile", "location", e.target.value),
            placeholder: "City, Country",
            className:
              "w-full px-4 py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all",
          }),
        ),
      ),
    );
  const renderFitnessGoalsSettings = () =>
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "space-y-4 sm:space-y-6",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(Target, {
              size: 16,
            }),
            "Primary Fitness Goal",
          ),
          /*#__PURE__*/ React.createElement(
            "select",
            {
              value: settings.fitnessGoals.goal,
              onChange: (e) =>
                handleSettingChange("fitnessGoals", "goal", e.target.value),
              className:
                "w-full px-4 py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all",
            },
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "lose",
              },
              /*#__PURE__*/ React.createElement(Star, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Lose Weight",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "maintain",
              },
              /*#__PURE__*/ React.createElement(Scale, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Maintain Weight",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "gain",
              },
              /*#__PURE__*/ React.createElement(TrendingUp, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Gain Weight",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "muscle",
              },
              /*#__PURE__*/ React.createElement(BicepsFlexed, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Build Muscle",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "strength",
              },
              /*#__PURE__*/ React.createElement(Zap, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Increase Strength",
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
                "block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(Target, {
              size: 16,
            }),
            "Activity Level",
          ),
          /*#__PURE__*/ React.createElement(
            "select",
            {
              value: settings.fitnessGoals.activityLevel,
              onChange: (e) =>
                handleSettingChange(
                  "fitnessGoals",
                  "activityLevel",
                  e.target.value,
                ),
              className:
                "w-full px-4 py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all",
            },
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "sedentary",
              },
              /*#__PURE__*/ React.createElement(Armchair, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Sedentary (Little/No Exercise)",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "light",
              },
              /*#__PURE__*/ React.createElement(Footprints, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Light (1-3 days/week)",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "moderate",
              },
              /*#__PURE__*/ React.createElement(Activity, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Moderate (3-5 days/week)",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "very",
              },
              /*#__PURE__*/ React.createElement(Dumbbell, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Very Active (6-7 days/week)",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "extra",
              },
              /*#__PURE__*/ React.createElement(Zap, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Extra Active (2x/day, intense)",
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
                "block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(Target, {
              size: 16,
            }),
            "Target Weight (kg)",
          ),
          /*#__PURE__*/ React.createElement("input", {
            type: "number",
            value: settings.fitnessGoals.targetWeight || "",
            onChange: (e) =>
              handleSettingChange(
                "fitnessGoals",
                "targetWeight",
                e.target.value ? parseFloat(e.target.value) : null,
              ),
            placeholder: "Enter target weight",
            className:
              "w-full px-4 py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all",
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(Target, {
              size: 16,
            }),
            "Weekly Workout Goal",
          ),
          /*#__PURE__*/ React.createElement(
            "select",
            {
              value: settings.fitnessGoals.weeklyGoal,
              onChange: (e) =>
                handleSettingChange(
                  "fitnessGoals",
                  "weeklyGoal",
                  parseInt(e.target.value),
                ),
              className:
                "w-full px-4 py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all",
            },
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 1,
              },
              "1 workout per week",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 2,
              },
              "2 workouts per week",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 3,
              },
              "3 workouts per week",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 4,
              },
              "4 workouts per week",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 5,
              },
              "5 workouts per week",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 6,
              },
              "6 workouts per week",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 7,
              },
              "7 workouts per week (Daily)",
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "p-4 sm:p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded-xl sm:rounded-2xl",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-green-300 text-sm flex items-center gap-2 mb-3",
          },
          /*#__PURE__*/ React.createElement("span", {
            className: "w-2 h-2 bg-red-500 rounded-full animate-pulse",
          }),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "font-medium",
            },
            "Current Fitness Goals & Progress",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-red-500 font-bold text-lg",
              },
              settings.fitnessGoals.goal === "lose" ? <Flame className="w-[1em] h-[1em] inline-block"/> : settings.fitnessGoals.goal === "gain" ? <TrendingUp className="w-[1em] h-[1em] inline-block"/> : settings.fitnessGoals.goal === "muscle" ? <BicepsFlexed className="w-[1em] h-[1em] inline-block"/> : settings.fitnessGoals.goal === "strength" ? <Zap className="w-[1em] h-[1em] inline-block"/> : <Scale className="w-[1em] h-[1em] inline-block"/>,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-neutral-300 capitalize",
              },
              settings.fitnessGoals.goal,
              " Weight",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-red-500 font-bold text-lg",
              },
              settings.fitnessGoals.weeklyGoal,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-neutral-300",
              },
              "Weekly Goal",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-xs text-blue-300 mt-1",
              },
              Math.min(
                realTimeStats.totalWorkouts,
                settings.fitnessGoals.weeklyGoal,
              ),
              "/",
              settings.fitnessGoals.weeklyGoal,
              " this week",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-red-600 font-bold text-lg capitalize",
              },
              settings.fitnessGoals.activityLevel,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-neutral-300",
              },
              "Activity Level",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-orange-400 font-bold text-lg",
              },
              settings.fitnessGoals.targetWeight
                ? `${settings.fitnessGoals.targetWeight}kg`
                : "Not Set",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-neutral-300",
              },
              "Target Weight",
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mt-3",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex items-center justify-between text-xs text-neutral-400 mb-1",
            },
            /*#__PURE__*/ React.createElement("span", null, "Weekly Progress"),
            /*#__PURE__*/ React.createElement(
              "span",
              null,
              Math.min(
                realTimeStats.totalWorkouts,
                settings.fitnessGoals.weeklyGoal,
              ),
              "/",
              settings.fitnessGoals.weeklyGoal,
              " workouts",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "w-full bg-neutral-800 rounded-full h-2",
            },
            /*#__PURE__*/ React.createElement("div", {
              className:
                "bg-gradient-to-r from-red-600 to-red-600 h-2 rounded-full transition-all duration-500",
              style: {
                width: `${Math.min(100, (realTimeStats.totalWorkouts / settings.fitnessGoals.weeklyGoal) * 100)}%`,
              },
            }),
          ),
        ),
      ),
    );
  const renderNotificationsSettings = () =>
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "space-y-4 sm:space-y-6",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "p-4 sm:p-6 bg-gradient-to-r from-neutral-900/80 to-black/80 rounded-xl sm:rounded-2xl border border-neutral-800/50 backdrop-blur-sm",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex items-center gap-3 mb-3",
          },
          /*#__PURE__*/ React.createElement("div", {
            className:
              "w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full animate-pulse",
          }),
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-lg sm:text-xl font-black text-white",
              style: {
                fontFamily: "var(--font-heading)",
              },
            },
            /*#__PURE__*/ React.createElement(Bell, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " NOTIFICATION CENTER",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "px-2 sm:px-3 py-1 bg-red-600/20 text-red-500 text-xs font-bold rounded-full border border-red-600/30",
            },
            "REAL-TIME",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-neutral-300 text-sm sm:text-base",
          },
          "Professional gym notifications \u2022 Instant MongoDB sync \u2022 Cross-device alerts",
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "space-y-3 sm:space-y-4",
        },
        [
          {
            key: "emailNotifications",
            title: "Email Notifications",
            description:
              "Receive workout updates and progress reports via email",
            icon: Mail,
            color: "from-red-600 to-red-600",
            emoji: /*#__PURE__*/ React.createElement(Mail, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          },
          {
            key: "pushNotifications",
            title: "Push Notifications",
            description:
              "Get instant workout alerts and reminders on your device",
            icon: Bell,
            color: "from-yellow-500 to-orange-500",
            emoji: /*#__PURE__*/ React.createElement(Bell, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          },
          {
            key: "workoutReminders",
            title: "Workout Reminders",
            description:
              "Daily gym reminders to stay consistent with your fitness goals",
            icon: Target,
            color: "from-red-600 to-red-600",
            emoji: /*#__PURE__*/ React.createElement(Dumbbell, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          },
          {
            key: "mealReminders",
            title: "Nutrition Reminders",
            description:
              "Smart reminders to log meals and track your nutrition intake",
            icon: Activity,
            color: "from-red-700 to-violet-500",
            emoji: /*#__PURE__*/ React.createElement(Apple, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          },
        ].map((notification) => {
          const isEnabled = settings.notifications[notification.key];
          return /*#__PURE__*/ React.createElement(
            motion.div,
            {
              key: notification.key,
              whileHover: {
                scale: 1.02,
              },
              className: `relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-300 ${isEnabled ? `border-red-600/50 bg-gradient-to-br from-neutral-900/80 to-black/80 shadow-xl shadow-red-600/10` : "border-neutral-700/50 bg-gradient-to-br from-neutral-900/40 to-black/40"}`,
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "absolute inset-0 opacity-5",
              },
              /*#__PURE__*/ React.createElement("div", {
                className: `w-full h-full bg-gradient-to-r ${notification.color}`,
              }),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "relative z-10 p-4 sm:p-6",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex items-start sm:items-center gap-3 sm:gap-4 flex-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: `p-2 sm:p-3 rounded-xl transition-all flex-shrink-0 ${isEnabled ? `bg-gradient-to-r ${notification.color}/20 text-white shadow-lg border border-white/10` : "bg-neutral-800/50 text-neutral-400"}`,
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-xl sm:text-2xl",
                      },
                      notification.emoji,
                    ),
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
                          "flex flex-col sm:flex-row sm:items-center gap-2 mb-2",
                      },
                      /*#__PURE__*/ React.createElement(
                        "h4",
                        {
                          className:
                            "text-white font-bold text-sm sm:text-base",
                        },
                        notification.title,
                      ),
                      isEnabled &&
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className:
                              "text-xs bg-red-600/20 text-red-500 px-2 py-1 rounded-full border border-red-600/30 w-fit",
                          },
                          /*#__PURE__*/ React.createElement(CheckCircle2, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " ACTIVE",
                        ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "p",
                      {
                        className:
                          "text-neutral-400 text-xs sm:text-sm leading-relaxed",
                      },
                      notification.description,
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  motion.button,
                  {
                    whileHover: {
                      scale: 1.05,
                    },
                    whileTap: {
                      scale: 0.95,
                    },
                    onClick: () =>
                      handleSettingChange(
                        "notifications",
                        notification.key,
                        !isEnabled,
                      ),
                    className: `relative w-14 h-7 sm:w-16 sm:h-8 rounded-full transition-all duration-300 flex-shrink-0 ${isEnabled ? "bg-gradient-to-r from-red-600 to-red-600 shadow-lg shadow-red-600/25" : "bg-neutral-700"}`,
                  },
                  /*#__PURE__*/ React.createElement(motion.div, {
                    animate: {
                      x: isEnabled ? (window.innerWidth >= 640 ? 32 : 28) : 2,
                    },
                    transition: {
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    },
                    className: `absolute top-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all ${isEnabled ? "bg-white shadow-md" : "bg-neutral-300"}`,
                  }),
                ),
              ),
            ),
          );
        }),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "p-4 sm:p-6 bg-gradient-to-br from-neutral-900/80 to-black/80 rounded-xl sm:rounded-2xl border border-neutral-800/50 backdrop-blur-sm",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex items-center gap-3 mb-4 sm:mb-6",
          },
          /*#__PURE__*/ React.createElement("div", {
            className:
              "w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full animate-pulse",
          }),
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-lg sm:text-xl font-black text-white",
              style: {
                fontFamily: "var(--font-heading)",
              },
            },
            /*#__PURE__*/ React.createElement(BarChart3, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " NOTIFICATION STATUS",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "px-2 sm:px-3 py-1 bg-red-600/20 text-red-500 text-xs font-bold rounded-full border border-red-600/30",
            },
            "LIVE SYNC",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6",
          },
          Object.entries(settings.notifications).map(([key, enabled]) => {
            const labels = {
              emailNotifications: {
                name: "Email",
                emoji: /*#__PURE__*/ React.createElement(Mail, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              },
              pushNotifications: {
                name: "Push",
                emoji: /*#__PURE__*/ React.createElement(Bell, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              },
              workoutReminders: {
                name: "Workouts",
                emoji: /*#__PURE__*/ React.createElement(Dumbbell, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              },
              mealReminders: {
                name: "Nutrition",
                emoji: /*#__PURE__*/ React.createElement(Apple, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              },
            };
            return /*#__PURE__*/ React.createElement(
              motion.div,
              {
                key: key,
                className: `text-center p-3 sm:p-4 rounded-xl border transition-all ${enabled ? "bg-red-600/10 border-red-600/30 shadow-lg" : "bg-neutral-900/30 border-neutral-700/30"}`,
                whileHover: {
                  scale: 1.05,
                },
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-xl sm:text-2xl mb-1 sm:mb-2",
                },
                labels[key]?.emoji,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: `font-bold text-lg sm:text-xl mb-1 ${enabled ? "text-red-500" : "text-red-400"}`,
                },
                enabled ? <CheckCircle2 className="w-[1em] h-[1em] inline-block"/> : <XCircle className="w-[1em] h-[1em] inline-block"/>,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-neutral-300 text-xs sm:text-sm font-medium",
                },
                labels[key]?.name,
              ),
            );
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600/20 to-red-600/20 rounded-full border border-red-600/30",
            },
            /*#__PURE__*/ React.createElement("div", {
              className: "w-2 h-2 bg-red-500 rounded-full animate-pulse",
            }),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-red-500 text-xs sm:text-sm font-bold",
              },
              "Changes applied instantly \u2022 MongoDB real-time sync",
            ),
          ),
        ),
      ),
    );
  const renderPreferencesSettings = () => {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "space-y-4 sm:space-y-6",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(Moon, {
              size: 16,
            }),
            "Theme (Dark Mode Only)",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "space-y-3",
            },
            /*#__PURE__*/ React.createElement(
              motion.div,
              {
                className:
                  "p-4 rounded-xl border border-red-600 bg-gradient-to-r from-neutral-700/10 to-neutral-900/10 shadow-lg",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-3",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "p-2 rounded-lg bg-gradient-to-r from-neutral-700/20 to-neutral-900/20 text-white shadow-md",
                  },
                  /*#__PURE__*/ React.createElement(Moon, {
                    size: 18,
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-white font-medium flex items-center gap-2",
                    },
                    "Dark Mode",
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className:
                          "text-xs bg-red-600/20 text-red-500 px-2 py-1 rounded-full border border-red-600/30",
                      },
                      "Active",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-neutral-400 text-sm",
                    },
                    "Perfect for gym environments - Professional experience",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-red-500 text-xl",
                  },
                  "\u2713",
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "mt-4 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-blue-300 text-sm flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "animate-pulse",
                },
                /*#__PURE__*/ React.createElement(Palette, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                null,
                "GymTracker uses ",
                /*#__PURE__*/ React.createElement(
                  "strong",
                  null,
                  /*#__PURE__*/ React.createElement(Moon, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Dark Mode Only",
                ),
                " for the best gym experience",
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
                "block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(Globe, {
              size: 16,
            }),
            "Language",
          ),
          /*#__PURE__*/ React.createElement(
            "select",
            {
              value: settings.preferences.language,
              onChange: (e) =>
                handleSettingChange("preferences", "language", e.target.value),
              className:
                "w-full px-4 py-3 bg-neutral-900/60 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all",
            },
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "en",
              },
              /*#__PURE__*/ React.createElement(Flag, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " English",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "es",
              },
              /*#__PURE__*/ React.createElement(Flag, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Spanish",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "fr",
              },
              /*#__PURE__*/ React.createElement(Flag, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " French",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: "de",
              },
              /*#__PURE__*/ React.createElement(Flag, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " German",
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "mt-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-green-300 text-sm flex items-center gap-2",
          },
          /*#__PURE__*/ React.createElement("span", {
            className: "w-2 h-2 bg-red-500 rounded-full animate-pulse",
          }),
          /*#__PURE__*/ React.createElement(
            "span",
            null,
            "Dark mode is permanently enabled \u2022 Professional gym experience \u2022 Real-time MongoDB sync",
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-blue-300 text-sm flex items-center gap-2 mb-2",
          },
          /*#__PURE__*/ React.createElement(BarChart3, {
            size: 16,
          }),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "font-medium",
            },
            "Real-Time Activity Summary",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "grid grid-cols-3 gap-3 text-xs",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-red-500 font-bold",
              },
              realTimeStats.totalWorkouts,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-neutral-300",
              },
              "Total Workouts",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-red-500 font-bold",
              },
              realTimeStats.totalMeals,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-neutral-300",
              },
              "Total Meals",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-yellow-400 font-bold",
              },
              realTimeStats.totalPlans,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-neutral-300",
              },
              "Total Plans",
            ),
          ),
        ),
      ),
    );
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileSettings();
      case "fitness":
        return renderFitnessGoalsSettings();
      case "notifications":
        return renderNotificationsSettings();
      case "preferences":
        return renderPreferencesSettings();
      case "data":
        return /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-4 sm:space-y-6",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "p-4 bg-neutral-900/40 rounded-lg border border-neutral-700/30",
              },
              /*#__PURE__*/ React.createElement(
                "h4",
                {
                  className:
                    "text-white font-medium mb-3 flex items-center gap-2",
                },
                /*#__PURE__*/ React.createElement(Database, {
                  size: 16,
                }),
                "Data Storage Status",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "space-y-3 text-sm",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex justify-between",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-300",
                    },
                    "MongoDB Connection:",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: isOnline ? "text-red-500" : "text-red-400",
                    },
                    isOnline ? <><CheckCircle2 className="w-[1em] h-[1em] inline-block"/> Connected</> : <><XCircle className="w-[1em] h-[1em] inline-block"/> Offline</>,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex justify-between",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-300",
                    },
                    "Auto Backup:",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-red-500",
                    },
                    /*#__PURE__*/ React.createElement(CheckCircle2, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Enabled",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex justify-between",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-300",
                    },
                    "Cross-Device Sync:",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-red-500",
                    },
                    /*#__PURE__*/ React.createElement(CheckCircle2, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Active",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex justify-between",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-300",
                    },
                    "Data Retention:",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-red-500",
                    },
                    "1 Year",
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "p-4 bg-neutral-900/40 rounded-lg border border-neutral-700/30",
              },
              /*#__PURE__*/ React.createElement(
                "h4",
                {
                  className:
                    "text-white font-medium mb-3 flex items-center gap-2",
                },
                /*#__PURE__*/ React.createElement(Clock, {
                  size: 16,
                }),
                "Real-Time Sync Status",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "space-y-3 text-sm",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex justify-between",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-300",
                    },
                    "Last Sync:",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-red-500",
                    },
                    realTimeStats.lastSync
                      ? new Date(realTimeStats.lastSync).toLocaleTimeString()
                      : "Never",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex justify-between",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-300",
                    },
                    "Sync Status:",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: `${statusDisplay.color.split(" ")[0]}`,
                    },
                    statusDisplay.text,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex justify-between",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-300",
                    },
                    "Auto-Sync:",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-red-500",
                    },
                    /*#__PURE__*/ React.createElement(CheckCircle2, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Every 30s",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex justify-between",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-300",
                    },
                    "Data Source:",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-red-500",
                    },
                    "MongoDB Atlas",
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/50 rounded-lg",
            },
            /*#__PURE__*/ React.createElement(
              "h4",
              {
                className:
                  "text-white font-medium mb-3 flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(BarChart3, {
                size: 16,
              }),
              "Real-Time Data Summary",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-2xl font-bold text-red-500",
                  },
                  realTimeStats.totalWorkouts,
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-neutral-300",
                  },
                  "Workouts Stored",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-2xl font-bold text-red-500",
                  },
                  realTimeStats.totalMeals,
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-neutral-300",
                  },
                  "Meals Logged",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-2xl font-bold text-red-600",
                  },
                  realTimeStats.totalPlans,
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-neutral-300",
                  },
                  "Plans Created",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-2xl font-bold text-orange-400",
                  },
                  realTimeStats.membershipDays,
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-neutral-300",
                  },
                  "Days Active",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "mt-3 text-xs text-center text-neutral-400",
              },
              "All data is stored securely in MongoDB and synced in real-time across all your devices",
            ),
          ),
        );
      default:
        return /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-center py-8",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-neutral-400 mb-2",
            },
            "Coming Soon",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-neutral-500 text-sm",
            },
            "This section is under development",
          ),
        );
    }
  };
  const statusDisplay = settingsService.getSyncStatus(lastSyncResult);
  if (loading) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "flex items-center justify-center min-h-[400px]",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-center",
        },
        /*#__PURE__*/ React.createElement("div", {
          className:
            "animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto",
        }),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "mt-4 text-neutral-400",
          },
          "Loading real-time settings...",
        ),
      ),
    );
  }
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "space-y-4 sm:space-y-6",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-xl border border-neutral-800/50 shadow-2xl",
      },
      /*#__PURE__*/ React.createElement("div", {
        className:
          "absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-cyan-900/10",
      }),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "relative z-10 p-4 sm:p-6 lg:p-8",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center gap-3 sm:gap-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-3xl sm:text-4xl",
              },
              /*#__PURE__*/ React.createElement(Settings, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "h1",
                {
                  className:
                    "text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1",
                  style: {
                    fontFamily: "var(--font-heading)",
                  },
                },
                /*#__PURE__*/ React.createElement(BicepsFlexed, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " GYM SETTINGS",
              ),
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className: "text-neutral-300 text-sm sm:text-base",
                },
                "Professional Configuration \u2022 Real-Time MongoDB Sync",
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: `flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold ${statusDisplay.color}`,
              },
              /*#__PURE__*/ React.createElement("div", {
                className: "w-2 h-2 bg-current rounded-full animate-pulse",
              }),
              statusDisplay.icon,
              " ",
              statusDisplay.text,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "px-3 py-2 bg-red-600/20 text-red-500 text-xs font-bold rounded-full border border-red-600/30",
              },
              /*#__PURE__*/ React.createElement(RefreshCw, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " AUTO-SYNC",
            ),
          ),
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "flex justify-center sm:justify-end",
      },
      /*#__PURE__*/ React.createElement(
        motion.button,
        {
          whileHover: {
            scale: 1.05,
          },
          whileTap: {
            scale: 0.95,
          },
          onClick: handleSave,
          disabled: isSaving,
          className:
            "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-full shadow-xl shadow-red-600/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 text-sm sm:text-base",
        },
        isSaving
          ? /*#__PURE__*/ React.createElement("div", {
              className:
                "animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full",
            })
          : /*#__PURE__*/ React.createElement(Save, {
              size: 18,
            }),
        /*#__PURE__*/ React.createElement(
          "span",
          null,
          isSaving ? <><RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> SYNCING TO MONGODB...</> : <><Save className="w-[1em] h-[1em] inline-block"/> SAVE TO CLOUD</>,
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "lg:col-span-1",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-xl border border-neutral-800/50 shadow-2xl",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "p-4 sm:p-6 border-b border-neutral-800/50",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-3 mb-2",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-xl sm:text-2xl",
                },
                /*#__PURE__*/ React.createElement(Sliders, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "h3",
                {
                  className: "font-black text-white text-sm sm:text-base",
                  style: {
                    fontFamily: "var(--font-heading)",
                  },
                },
                "CONTROL PANEL",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "px-2 py-1 bg-red-600/20 text-red-500 text-xs font-bold rounded-full border border-red-600/30",
                },
                "LIVE",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "px-2 py-1 bg-red-600/20 text-red-500 text-xs font-bold rounded-full border border-red-600/30",
                },
                "MONGODB",
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "space-y-1 sm:space-y-2 p-3 sm:p-4",
            },
            settingsTabs.map((tab) =>
              /*#__PURE__*/ React.createElement(
                motion.button,
                {
                  key: tab.id,
                  whileHover: {
                    scale: 1.02,
                  },
                  whileTap: {
                    scale: 0.98,
                  },
                  onClick: () => setActiveTab(tab.id),
                  className: `w-full flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-xl transition-all duration-300 ${activeTab === tab.id ? `bg-gradient-to-r ${tab.color}/20 border border-white/20 text-white shadow-lg backdrop-blur-sm` : "text-neutral-300 hover:text-white hover:bg-neutral-800/50 border border-transparent"}`,
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: `p-2 rounded-lg transition-all ${activeTab === tab.id ? "bg-white/10 shadow-md" : "bg-neutral-800/50"}`,
                  },
                  /*#__PURE__*/ React.createElement(tab.icon, {
                    size: 16,
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "font-bold text-xs sm:text-sm flex-1 text-left",
                  },
                  tab.label,
                ),
                activeTab === tab.id &&
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-white text-lg",
                    },
                    /*#__PURE__*/ React.createElement(Star, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
              ),
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "lg:col-span-3",
        },
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            key: activeTab,
            initial: {
              opacity: 0,
              y: 20,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            transition: {
              duration: 0.3,
            },
            className:
              "relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-xl border border-neutral-800/50 shadow-2xl",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "absolute inset-0 opacity-5",
            },
            /*#__PURE__*/ React.createElement("div", {
              className: `w-full h-full bg-gradient-to-r ${settingsTabs.find((tab) => tab.id === activeTab)?.color}`,
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "relative z-10 p-4 sm:p-6 lg:p-8",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "mb-6 sm:mb-8",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-3 sm:gap-4",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: `p-3 sm:p-4 rounded-xl bg-gradient-to-r ${settingsTabs.find((tab) => tab.id === activeTab)?.color}/20 border border-white/10 shadow-lg`,
                    },
                    /*#__PURE__*/ React.createElement(
                      settingsTabs.find((tab) => tab.id === activeTab)?.icon,
                      {
                        size: 24,
                        className: "text-white",
                      },
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "flex flex-col sm:flex-row sm:items-center gap-2",
                      },
                      /*#__PURE__*/ React.createElement(
                        "h3",
                        {
                          className:
                            "text-xl sm:text-2xl font-black text-white",
                          style: {
                            fontFamily: "var(--font-heading)",
                          },
                        },
                        settingsTabs.find((tab) => tab.id === activeTab)?.label,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            "text-xs bg-red-600/20 text-red-500 px-2 py-1 rounded-full border border-red-600/30 animate-pulse w-fit",
                        },
                        /*#__PURE__*/ React.createElement(Star, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                        " LIVE",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "p",
                      {
                        className: "text-xs sm:text-sm text-neutral-400 mt-1",
                      },
                      "Professional Configuration \u2022 Real-Time MongoDB \u2022 Cross-Device Sync",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-right",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs text-neutral-400",
                    },
                    "Last Sync",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs sm:text-sm text-red-500 font-bold",
                    },
                    realTimeStats.lastSync
                      ? new Date(realTimeStats.lastSync).toLocaleTimeString()
                      : "Loading...",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement("div", {
                className: `h-1 bg-gradient-to-r ${settingsTabs.find((tab) => tab.id === activeTab)?.color} rounded-full w-16 sm:w-24`,
              }),
            ),
            renderTabContent(),
          ),
        ),
      ),
    ),
  );
}
