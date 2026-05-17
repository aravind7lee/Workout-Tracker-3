import { CheckCircle2, BarChart3, Dumbbell, ClipboardList, Utensils, Trash2, BicepsFlexed, Circle } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";
import {
  clearAllOldMealData,
  initializeEmptyUserMeals,
} from "../utils/clearOldMealData";


export default function RealTimeStats() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalPlans: 0,
    totalMeals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const { user } = useAuth();
  const { stats: contextStats, isOnline: contextOnline } = useRealTime();
  const navigate = useNavigate();
  const loadRealTimeStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Try analytics endpoint first for most accurate meal count
      const analyticsResponse = await fetch("/api/analytics/hero-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success && analyticsData.data) {
          setIsOnline(true);
          setStats({
            totalWorkouts: Math.max(
              analyticsData.data.totalWorkouts || 0,
              contextStats.totalWorkouts || 0,
            ),
            totalPlans: Math.max(contextStats.totalPlans || 0, 0),
            // Use context for plans
            totalMeals: analyticsData.data.totalMeals || 0, // Use analytics for accurate meal count
          });
          console.log(
            "✅ RealTimeStats: Using analytics data for meal count:",
            analyticsData.data.totalMeals,
          );
          return;
        }
      }

      // Fallback to users stats endpoint
      const response = await fetch("/api/users/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIsOnline(true);
        setStats({
          totalWorkouts: Math.max(
            data.totalWorkouts || 0,
            contextStats.totalWorkouts || 0,
          ),
          totalPlans: Math.max(
            data.totalPlans || 0,
            contextStats.totalPlans || 0,
          ),
          totalMeals: data.totalMeals || 0,
        });
      } else {
        loadLocalStats();
        setIsOnline(contextOnline);
      }
    } catch (error) {
      console.warn("Database unavailable, using local data:", error);
      loadLocalStats();
      setIsOnline(contextOnline);
    } finally {
      setLoading(false);
    }
  };
  const loadLocalStats = () => {
    try {
      // Get user-specific meals
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (!currentUser) {
        setStats({
          totalWorkouts: 0,
          totalPlans: 0,
          totalMeals: 0,
        });
        return;
      }
      const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
      const meals = JSON.parse(localStorage.getItem(userMealKey) || "[]");
      const allPlans = JSON.parse(localStorage.getItem("workoutPlans") || "[]");
      console.log(
        "📊 RealTimeStats: Loading meals from:",
        userMealKey,
        "Found:",
        meals.length,
        "meals",
      );

      // Filter plans by current user - same as Analytics
      const userPlans = allPlans.filter((plan) => {
        return (
          plan.userId === currentUser.id ||
          plan.userId === currentUser._id ||
          (!plan.userId && plan.synced === false)
        );
      });
      const totalWorkouts = contextStats.totalWorkouts || 0;
      const totalPlans = contextStats.totalPlans || userPlans.length;
      setStats({
        totalWorkouts,
        totalPlans,
        totalMeals: meals.length,
      });
      console.log("✅ RealTimeStats updated:", {
        totalWorkouts,
        totalPlans,
        totalMeals: meals.length,
      });
    } catch (error) {
      console.error("Error loading local stats:", error);
      setStats({
        totalWorkouts: 0,
        totalPlans: 0,
        totalMeals: 0,
      });
    }
  };
  useEffect(() => {
    if (contextStats.totalWorkouts !== undefined) {
      setStats((prev) => ({
        ...prev,
        totalWorkouts: contextStats.totalWorkouts,
        totalPlans: contextStats.totalPlans || prev.totalPlans,
      }));
    }
  }, [contextStats]);
  useEffect(() => {
    // Only clear old data if no user-specific meals exist
    if (user) {
      const userMealKey = `recentMeals_${user.id || user._id}`;
      const existingUserMeals = localStorage.getItem(userMealKey);
      if (!existingUserMeals) {
        clearAllOldMealData();
        initializeEmptyUserMeals(user.id || user._id);
      }
    }

    // Load local stats first to show existing data immediately
    loadLocalStats();
    loadRealTimeStats();
    const handleWorkoutComplete = () => {
      console.log("🏋️ Workout completed - refreshing stats");
      loadRealTimeStats();
    };

    // INSTANT PLAN UPDATES - Same as Analytics
    const getUserPlanCount = () => {
      const allPlans = JSON.parse(localStorage.getItem("workoutPlans") || "[]");
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (!currentUser) return 0;
      const userPlans = allPlans.filter((plan) => {
        return (
          plan.userId === currentUser.id ||
          plan.userId === currentUser._id ||
          (!plan.userId && plan.synced === false)
        );
      });
      return userPlans.length;
    };

    // INSTANT MEAL UPDATES - Same as workout plans
    const getUserMealCount = () => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (!currentUser) return 0;
      const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
      const meals = JSON.parse(localStorage.getItem(userMealKey) || "[]");
      return meals.length;
    };
    const handlePlanCreated = () => {
      console.log("📋 RealTimeStats: Plan created - instant update");
      const userPlanCount = getUserPlanCount();
      setStats((prev) => ({
        ...prev,
        totalPlans: userPlanCount,
      }));
    };
    const handlePlanUpdated = () => {
      const userPlanCount = getUserPlanCount();
      setStats((prev) => ({
        ...prev,
        totalPlans: userPlanCount,
      }));
    };
    const handlePlanDeleted = () => {
      const userPlanCount = getUserPlanCount();
      setStats((prev) => ({
        ...prev,
        totalPlans: userPlanCount,
      }));
    };
    const handleDashboardUpdate = (event) => {
      if (
        event.detail &&
        (event.detail.type === "planCreated" ||
          event.detail.type === "planDeleted" ||
          event.detail.type === "planSynced")
      ) {
        const userPlanCount = getUserPlanCount();
        setStats((prev) => ({
          ...prev,
          totalPlans: userPlanCount,
        }));
      }
    };
    const handleMealAdded = () => {
      console.log("🍽️ RealTimeStats: Meal added - instant update");
      const userMealCount = getUserMealCount();
      setStats((prev) => ({
        ...prev,
        totalMeals: userMealCount,
      }));
    };
    const handleMealDeleted = () => {
      console.log("🗑️ RealTimeStats: Meal deleted - instant update");
      const userMealCount = getUserMealCount();
      setStats((prev) => ({
        ...prev,
        totalMeals: userMealCount,
      }));
    };
    window.addEventListener("workoutCompleted", handleWorkoutComplete);
    window.addEventListener("planCreated", handlePlanCreated);
    window.addEventListener("planUpdated", handlePlanUpdated);
    window.addEventListener("planDeleted", handlePlanDeleted);
    window.addEventListener("dashboardUpdate", handleDashboardUpdate);
    window.addEventListener("mealAdded", handleMealAdded);
    window.addEventListener("mealDeleted", handleMealDeleted);
    return () => {
      window.removeEventListener("workoutCompleted", handleWorkoutComplete);
      window.removeEventListener("planCreated", handlePlanCreated);
      window.removeEventListener("planUpdated", handlePlanUpdated);
      window.removeEventListener("planDeleted", handlePlanDeleted);
      window.removeEventListener("dashboardUpdate", handleDashboardUpdate);
      window.removeEventListener("mealAdded", handleMealAdded);
      window.removeEventListener("mealDeleted", handleMealDeleted);
    };
  }, [user]);
  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };
  const getStatMessage = (label, value) => {
    switch (label) {
      case "Total Workouts":
        return value > 0 ? `${value} completed!` : "Start your first workout";
      case "Workout Plans":
        return value > 0 ? `${value} plans ready` : "Create your first plan";
      case "Total Meals":
        return value > 0 ? `${value} meals logged` : "Start tracking nutrition";
      default:
        return "Ready to start!";
    }
  };
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
    },
    loading
      ? Array.from({
          length: 3,
        }).map((_, i) =>
          /*#__PURE__*/ React.createElement(
            "div",
            {
              key: i,
              className: "card",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "animate-pulse",
              },
              /*#__PURE__*/ React.createElement("div", {
                className: "h-8 bg-neutral-800 rounded mb-2",
              }),
              /*#__PURE__*/ React.createElement("div", {
                className: "h-4 bg-neutral-800 rounded mb-1",
              }),
              /*#__PURE__*/ React.createElement("div", {
                className: "h-3 bg-neutral-800 rounded",
              }),
            ),
          ),
        )
      : [
          {
            label: "Total Workouts",
            value: formatNumber(stats.totalWorkouts),
            color: "text-red-500",
            icon: /*#__PURE__*/ React.createElement(BicepsFlexed, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            path: "/workouts",
          },
          {
            label: "Workout Plans",
            value: formatNumber(stats.totalPlans),
            color: "text-red-500",
            icon: /*#__PURE__*/ React.createElement(ClipboardList, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            path: "/my-plans",
          },
          {
            label: "Total Meals",
            value: formatNumber(stats.totalMeals),
            color: "text-orange-400",
            icon: /*#__PURE__*/ React.createElement(Utensils, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            path: "/nutrition",
          },
        ].map((stat, index) =>
          /*#__PURE__*/ React.createElement(
            "div",
            {
              key: index,
              className:
                "card relative overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg",
              onClick: () => navigate(stat.path),
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "absolute top-2 right-2 text-xs",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: `px-1 py-0.5 rounded-full text-xs ${isOnline ? "bg-red-600/20 text-red-500 border border-red-600/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`,
                },
                isOnline ? "🟢" : "🟡",
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
                  className: "text-lg mb-1",
                },
                stat.icon,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: `text-3xl font-bold ${stat.color} mb-1`,
                },
                stat.value,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-sm text-neutral-400 mb-1",
                },
                stat.label,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: `text-xs ${(stat.label === "Total Workouts" && stats.totalWorkouts > 0) || (stat.label === "Workout Plans" && stats.totalPlans > 0) || (stat.label === "Total Meals" && stats.totalMeals > 0) ? "text-red-500" : "text-gray-400"}`,
                },
                getStatMessage(
                  stat.label,
                  stat.label === "Total Workouts"
                    ? stats.totalWorkouts
                    : stat.label === "Workout Plans"
                      ? stats.totalPlans
                      : stat.label === "Total Meals"
                        ? stats.totalMeals
                        : 0,
                ),
              ),
            ),
          ),
        ),
  );
}
