// Real-Time MongoDB Dashboard - INSTANT PLAN UPDATES
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  CheckCircle2,
  Dumbbell,
  ClipboardList,
  RefreshCw,
  Zap,
  Star,
  BarChart3,
  Book,
  BicepsFlexed,
  Apple,
  Cloud,
  Check,
  Flame,
  Activity,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";
import { useRealTimeDashboard } from "../hooks/useRealTimeDashboard";
import { useRealTimeWorkouts } from "../hooks/useRealTimeWorkouts";
import DashboardHero from "../components/DashboardHero";
import AuthGuard from "../components/AuthGuard";
import DashboardErrorBoundary from "../components/DashboardErrorBoundary";
import api from "../utils/api";
import Dashboard1 from "../assets/Dashboard1.jpg";
import Dashboard2 from "../assets/Dashboard2.jpg";
import Dashboardnew from "../assets/Dashboardnew.jpg";
import FitnessIntelligenceWidget from "../components/FitnessIntelligenceWidget";

const Dashboard = () => {
  const {
    user: authUser,
    logout,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const {
    stats,
    isOnline,
    loading: statsLoading,
    refreshStats,
  } = useRealTime();

  const { stats: workoutStats, refreshStats: refreshWorkoutStats } =
    useRealTimeWorkouts();

  // REAL-TIME DASHBOARD HOOK - INSTANT PLAN UPDATES
  const {
    dashboardStats,
    planStats,
    recentPlans,
    syncStatus: planSyncStatus,
    refreshDashboard,
    forceSync,
    isOnline: plansOnline,
    isRealTime,
    lastSync: planLastSync,
  } = useRealTimeDashboard();

  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  const [showAllPlans, setShowAllPlans] = useState(false);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      if (!authLoading && !isAuthenticated()) {
        setLoading(false);
        return;
      }

      // Get workouts from real-time sync service first
      const localWorkouts =
        window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      setRecentWorkouts(localWorkouts);

      // Try to load from MongoDB backend as well
      try {
        const response = await api.get("/workouts");
        if (response?.data) {
          const mongoWorkouts = Array.isArray(response.data.workouts)
            ? response.data.workouts
            : Array.isArray(response.data)
              ? response.data
              : [];
          const realCompletedWorkouts = mongoWorkouts.filter(
            (workout) => workout.completed === true || workout.completedAt,
          );

          // Combine and deduplicate
          const allWorkouts = [...localWorkouts, ...realCompletedWorkouts];
          const uniqueWorkouts = allWorkouts.filter(
            (workout, index, self) =>
              index ===
              self.findIndex(
                (w) =>
                  w.id === workout.id ||
                  (w.exercise === workout.exercise &&
                    w.completedAt === workout.completedAt),
              ),
          );
          setRecentWorkouts(uniqueWorkouts);
        }
      } catch (apiError) {
        console.warn(
          "⚠️ MongoDB load failed, using local data:",
          apiError.message,
        );
      }
    } catch (error) {
      console.error("❌ Dashboard load error:", error.message);
      const fallbackWorkouts =
        window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      setRecentWorkouts(fallbackWorkouts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      setLoading(false);
      return;
    }
    if (authLoading) {
      return;
    }
    loadDashboardData();

    // Listen for real-time events
    const handleWorkoutCompleted = (event) => {
      const freshWorkouts =
        window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      setRecentWorkouts(freshWorkouts);

      if (event.detail) {
        const { workout, exercise, duration, sets, offline } = event.detail;
        setCompletionData({
          exercise,
          duration,
          sets,
          offline,
        });
        setShowCompletionMessage(true);
        setTimeout(() => setShowCompletionMessage(false), 5000);
      }

      refreshStats();
      setTimeout(() => loadDashboardData(), 1000);
    };

    const handlePlanCreated = () => {
      loadDashboardData();
    };

    const handleMealAdded = () => {
      refreshStats();
    };

    const handleMealDeleted = () => {
      refreshStats();
    };

    window.addEventListener("workoutCompleted", handleWorkoutCompleted);
    window.addEventListener("planCreated", handlePlanCreated);
    window.addEventListener("mealAdded", handleMealAdded);
    window.addEventListener("mealDeleted", handleMealDeleted);

    return () => {
      window.removeEventListener("workoutCompleted", handleWorkoutCompleted);
      window.removeEventListener("planCreated", handlePlanCreated);
      window.removeEventListener("mealAdded", handleMealAdded);
      window.removeEventListener("mealDeleted", handleMealDeleted);
    };
  }, [isAuthenticated, refreshStats, authLoading]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRefresh = async () => {
    refreshStats();
    loadDashboardData();
    await refreshDashboard();
  };

  const handleForceSync = async () => {
    const result = await forceSync();
    if (!result?.success) {
      console.error("❌ Force sync failed:", result?.error);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-neutral-400 font-medium tracking-wide text-sm">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      <AuthGuard>
        <div className="min-h-screen bg-black text-white selection:bg-red-500 selection:text-white">
          {/* Top Hero Section */}
          <DashboardHero />

          {/* Completion Toast Notification */}
          <AnimatePresence>
            {showCompletionMessage && completionData && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-md bg-neutral-900/95 border border-emerald-500/40 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Workout Completed!
                  </p>
                  <p className="text-sm font-semibold text-white truncate">
                    {completionData.exercise || "Great session logged"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Banner Hero Image */}
          <div className="bg-gradient-to-b from-black via-neutral-950 to-black py-4 sm:py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
              <motion.div
                className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/[0.08]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src={Dashboardnew}
                  alt="Professional Gym Training - Real-time fitness tracking"
                  className="w-full h-48 sm:h-72 md:h-96 lg:h-[420px] object-cover object-center"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </motion.div>
            </div>
          </div>

          {/* Main Content Layout Container */}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pb-32 sm:pb-36">
            
            {/* 1. Welcome & Status Card */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-900/90 via-neutral-900/60 to-neutral-950/90 border border-white/[0.08] p-4 sm:p-6 backdrop-blur-xl shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wide">
                      Welcome{authUser?.name ? `, ${authUser.name}` : ""}!
                    </h1>
                    <span className="text-xl sm:text-2xl">👋</span>
                  </div>
                  <p className="text-neutral-400 text-xs sm:text-sm">
                    Track progress, manage workouts, and crush your fitness goals.
                  </p>
                  
                  {/* Status Indicators */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] sm:text-xs ${
                        plansOnline
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          plansOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                        }`}
                      />
                      {plansOnline ? "LIVE MONGODB" : "OFFLINE MODE"}
                    </span>

                    {planLastSync && (
                      <span className="text-neutral-400 bg-neutral-800/60 border border-neutral-700/40 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono">
                        Synced{" "}
                        {new Date(planLastSync).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}

                    {planSyncStatus !== "idle" && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] sm:text-xs border ${
                          planSyncStatus === "syncing"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : planSyncStatus === "synced"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${
                            planSyncStatus === "syncing" ? "animate-spin" : ""
                          }`}
                        />
                        <span>
                          {planSyncStatus === "syncing"
                            ? "SYNCING"
                            : planSyncStatus === "synced"
                              ? "SYNCED"
                              : "ERROR"}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <button
                    onClick={handleRefresh}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-bold uppercase tracking-wide border border-neutral-700 transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={handleForceSync}
                    disabled={planSyncStatus === "syncing"}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wide border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md"
                  >
                    <Zap
                      className={`w-3.5 h-3.5 ${
                        planSyncStatus === "syncing" ? "animate-spin" : ""
                      }`}
                    />
                    <span>{planSyncStatus === "syncing" ? "Sync..." : "Sync"}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wide border border-red-500/30 transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Fitness Intelligence Widget */}
            <FitnessIntelligenceWidget />

            {/* 3. Beast Mode & Elite Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Beast Mode Card */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-900/95 via-neutral-900/80 to-black border border-orange-500/20 shadow-xl backdrop-blur-xl group">
                <div className="grid grid-cols-1 sm:grid-cols-2 min-h-[280px]">
                  <div className="p-5 sm:p-6 flex flex-col justify-between order-2 sm:order-1">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30 text-white">
                          <Star className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            BEAST MODE
                          </h3>
                          <span className="text-[10px] sm:text-xs font-bold text-orange-400 uppercase tracking-widest">
                            ACTIVATED
                          </span>
                        </div>
                      </div>
                      <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mt-2">
                        Transform your physique with precision tracking, real-time analytics, and champion mindset.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => navigate("/my-plans")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>Train</span>
                      </button>
                      <button
                        onClick={() => navigate("/analytics")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider border border-neutral-700 transition-all hover:scale-105 active:scale-95"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Stats</span>
                      </button>
                    </div>
                  </div>
                  <div className="relative h-44 sm:h-full order-1 sm:order-2 overflow-hidden">
                    <img
                      src={Dashboard1}
                      alt="Beast Mode Workout"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-l from-transparent via-black/40 to-neutral-950 sm:to-neutral-900" />
                  </div>
                </div>
              </div>

              {/* Elite Performance Card */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-900/95 via-neutral-900/80 to-black border border-red-600/20 shadow-xl backdrop-blur-xl group">
                <div className="grid grid-cols-1 sm:grid-cols-2 min-h-[280px]">
                  <div className="relative h-44 sm:h-full order-1 overflow-hidden">
                    <img
                      src={Dashboard2}
                      alt="Elite Performance Workout"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent via-black/40 to-neutral-950 sm:to-neutral-900" />
                  </div>
                  <div className="p-5 sm:p-6 flex flex-col justify-between order-2">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30 text-white">
                          <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            ELITE POWER
                          </h3>
                          <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-widest">
                            UNLEASHED
                          </span>
                        </div>
                      </div>
                      <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mt-2">
                        Elevate your routine with advanced split insights and customized library exercises.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => navigate("/analytics")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Analytics</span>
                      </button>
                      <button
                        onClick={() => navigate("/library")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider border border-neutral-700 transition-all hover:scale-105 active:scale-95"
                      >
                        <Book className="w-3.5 h-3.5" />
                        <span>Library</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Key Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {/* Total Workouts */}
              <button
                onClick={() => navigate("/workouts")}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900/90 to-neutral-900/50 border border-white/[0.08] hover:border-red-500/40 p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center shadow-md">
                    <BicepsFlexed className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {workoutStats?.lastUpdate || (isOnline && stats.isRealTime)
                      ? "LIVE"
                      : "OFF"}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono leading-none mb-1">
                  {stats?.totalWorkouts ?? dashboardStats?.totalWorkouts ?? 0}
                </div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Total Workouts
                </div>
                <div className="text-xs text-red-500 font-medium mt-1">
                  {(stats?.totalWorkouts || 0) > 0
                    ? `${stats?.totalWorkouts} sessions completed`
                    : "Ready to start!"}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </button>

              {/* Weekly Workouts */}
              <button
                onClick={() => navigate("/analytics")}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900/90 to-neutral-900/50 border border-white/[0.08] hover:border-red-500/40 p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center shadow-md">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {isOnline && stats.isRealTime ? "LIVE" : "OFF"}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono leading-none mb-1">
                  {stats?.weeklyWorkouts ?? 0}
                </div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  This Week
                </div>
                <div className="text-xs text-red-500 font-medium mt-1">
                  {(stats?.weeklyWorkouts || 0) > 0
                    ? `${stats?.weeklyWorkouts} logged this week`
                    : "Log a session today"}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </button>

              {/* Workout Plans */}
              <button
                onClick={() => navigate("/my-plans")}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900/90 to-neutral-900/50 border border-white/[0.08] hover:border-orange-500/40 p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shadow-md">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {plansOnline && isRealTime ? "SYNC" : "OFF"}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono leading-none mb-1">
                  {dashboardStats.totalPlans}
                </div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Workout Plans
                </div>
                <div className="text-xs text-orange-400 font-medium mt-1">
                  {dashboardStats.totalPlans > 0
                    ? `${dashboardStats.totalPlans} plans ready`
                    : "Create your first plan"}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </button>
            </div>

            {/* 5. Quick Actions Section */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-950/90 via-neutral-900/80 to-neutral-950/90 border border-white/[0.08] p-4 sm:p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-wider">
                    QUICK ACTIONS
                  </h2>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Fast access to your core fitness arsenal
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                {/* Library */}
                <button
                  onClick={() => navigate("/library")}
                  className="group p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/90 border border-white/[0.06] hover:border-red-500/40 text-center transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-md"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-600/30 mb-2 sm:mb-3">
                    <Book className="w-5 h-5" />
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                    Library
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Browse
                  </div>
                </button>

                {/* Plans */}
                <button
                  onClick={() => navigate("/my-plans")}
                  className="group p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/90 border border-white/[0.06] hover:border-orange-500/40 text-center transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-md"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-2 sm:mb-3">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                    Plans ({dashboardStats.totalPlans})
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Manage
                  </div>
                </button>

                {/* Meals */}
                <button
                  onClick={() => navigate("/nutrition")}
                  className="group p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/90 border border-white/[0.06] hover:border-amber-500/40 text-center transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-md"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 mb-2 sm:mb-3">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                    Meals
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    {stats.totalMeals > 0 ? `${stats.totalMeals} logged` : "Fuel"}
                  </div>
                </button>

                {/* Analytics */}
                <button
                  onClick={() => navigate("/analytics")}
                  className="group p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/90 border border-white/[0.06] hover:border-red-600/40 text-center transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-md"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 mb-2 sm:mb-3">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                    Analytics
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Track
                  </div>
                </button>
              </div>
            </div>

            {/* 6. MY WORKOUT PLANS Section */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-950/90 via-neutral-900/80 to-neutral-950/90 border border-white/[0.08] p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-2xl">
              {/* Header with Responsive Side-by-Side Alignment */}
              <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                    MY WORKOUT PLANS
                  </h2>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
                    Your personalized training arsenal
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {recentPlans && recentPlans.length > 3 && (
                    <button
                      onClick={() => setShowAllPlans(!showAllPlans)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold transition-all"
                    >
                      {showAllPlans ? "Show Less" : `More (${recentPlans.length})`}
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/plans")}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-red-600/25 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">CREATE PLAN</span>
                    <span className="sm:hidden">CREATE</span>
                  </button>
                </div>
              </div>

              {!recentPlans || recentPlans.length === 0 ? (
                /* Empty State */
                <div className="text-center py-8 sm:py-12 px-4 rounded-2xl bg-neutral-900/40 border border-white/[0.04]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-2xl text-red-500">
                    <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-wider mb-2">
                    {dashboardStats.loading
                      ? "LOADING ARSENAL..."
                      : "BUILD YOUR ARSENAL"}
                  </h3>
                  <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto mb-5 leading-relaxed">
                    {dashboardStats.loading
                      ? "Syncing your workout plans..."
                      : "No workout plans yet. Time to create your first masterpiece!"}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-400 mb-6 font-mono">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        plansOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                      }`}
                    />
                    <span>
                      {plansOnline ? "REAL-TIME MONGODB" : "OFFLINE MODE"}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => navigate("/plans")}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all w-full max-w-xs sm:w-auto"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>CREATE FIRST PLAN</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Populated Plans Grid */
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-4">
                    <div className="inline-flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[11px]">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      {plansOnline ? "REAL-TIME MONGODB PLANS" : "LOCAL PLANS"}
                    </div>
                    <div className="text-neutral-400 bg-neutral-800/60 border border-neutral-700/40 px-3 py-1 rounded-full text-[11px]">
                      {dashboardStats.totalPlans} TOTAL • {planStats.syncedPlans}{" "}
                      SYNCED
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5">
                    {(showAllPlans ? recentPlans : recentPlans.slice(0, 3)).map(
                      (plan, index) => (
                        <div
                          key={plan.id || index}
                          className="group relative bg-gradient-to-br from-neutral-900/90 to-neutral-900/60 border border-white/[0.08] hover:border-red-500/40 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className="font-black text-white text-sm sm:text-base uppercase tracking-wide truncate">
                                {plan.name || "UNNAMED PLAN"}
                              </h3>
                              {plan.synced ? (
                                <span
                                  className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50 shrink-0"
                                  title="Synced to MongoDB"
                                />
                              ) : (
                                <span
                                  className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse shrink-0"
                                  title="Pending sync"
                                />
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className="text-[10px] sm:text-xs text-neutral-300 bg-neutral-800/80 border border-neutral-700/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                                {plan.category || "GENERAL"}
                              </span>
                              <span className="text-[10px] sm:text-xs text-red-400 font-bold">
                                {plan.exercises?.length || 0} EXERCISES
                              </span>
                              {plan.isTemp && (
                                <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">
                                  • CREATING...
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <button
                              onClick={() => {
                                const workoutId =
                                  plan.id || plan.tempId || `temp_${Date.now()}`;
                                navigate(`/workout/${workoutId}`);
                              }}
                              className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
                            >
                              <Dumbbell className="w-3.5 h-3.5" />
                              <span>START</span>
                            </button>
                            <button
                              onClick={() => navigate("/my-plans")}
                              className="inline-flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>VIEW</span>
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 7. RECENT WORKOUTS Section */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-950/90 via-neutral-900/80 to-neutral-950/90 border border-white/[0.08] p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-2xl">
              {/* Header with Responsive Side-by-Side Alignment */}
              <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                    RECENT WORKOUTS
                  </h2>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
                    Your training history and achievements
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {recentWorkouts.length > 5 && (
                    <button
                      onClick={() => setShowAllWorkouts(!showAllWorkouts)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all"
                    >
                      {showAllWorkouts
                        ? "Show Less"
                        : `More (${recentWorkouts.length})`}
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/my-plans")}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">START WORKOUT</span>
                    <span className="sm:hidden">START</span>
                  </button>
                </div>
              </div>

              {!recentWorkouts || recentWorkouts.length === 0 ? (
                /* Empty State */
                <div className="text-center py-8 sm:py-12 px-4 rounded-2xl bg-neutral-900/40 border border-white/[0.04]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-orange-500/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-2xl text-orange-400">
                    <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-wider mb-2">
                    TIME TO DOMINATE
                  </h3>
                  <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto mb-5 leading-relaxed">
                    {isOnline
                      ? `No completed workouts found for ${
                          authUser?.name || "your account"
                        }. Ready to make history?`
                      : "No completed workouts found in local storage. Time to get started!"}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-400 mb-6 font-mono">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                      }`}
                    />
                    <span>
                      {isOnline
                        ? `REAL-TIME FOR ${
                            authUser?.name?.toUpperCase() || "USER"
                          }`
                        : "OFFLINE DEVICE DATA"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                    <button
                      onClick={() => navigate("/my-plans")}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>VIEW PLANS</span>
                    </button>
                    <button
                      onClick={() => navigate("/library")}
                      className="inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all"
                    >
                      <Book className="w-4 h-4" />
                      <span>BROWSE EXERCISES</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Populated Workouts List */
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
                    <div className="inline-flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[11px]">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                      {isOnline
                        ? `REAL-TIME DATA FOR ${
                            authUser?.name?.toUpperCase() || "YOU"
                          }`
                        : "YOUR LOCAL WORKOUTS"}
                    </div>
                    <div className="text-neutral-400 bg-neutral-800/60 border border-neutral-700/40 px-3 py-1 rounded-full text-[11px]">
                      {recentWorkouts.length} WORKOUT
                      {recentWorkouts.length !== 1 ? "S" : ""} COMPLETED
                    </div>
                  </div>

                  {(showAllWorkouts
                    ? recentWorkouts
                    : recentWorkouts.slice(0, 5)
                  ).map((workout, index) => (
                    <div
                      key={workout.id || index}
                      className="group relative bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-800/40 border border-white/[0.08] hover:border-red-500/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white shrink-0 shadow-md">
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-white text-xs sm:text-sm md:text-base uppercase tracking-wide truncate">
                            {workout.exercise ||
                              workout.planName ||
                              workout.exerciseName ||
                              "WORKOUT SESSION"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                            <span className="bg-neutral-800/80 border border-neutral-700/40 px-2 py-0.5 rounded-full text-neutral-300">
                              {workout.exercises?.length || 1} EX
                              {(workout.exercises?.length || 1) !== 1 ? "S" : ""}
                            </span>
                            <span className="text-emerald-400 font-bold">
                              ✓ COMPLETED
                            </span>
                            {workout.synced && (
                              <span className="text-blue-400 font-semibold inline-flex items-center gap-1">
                                <Cloud className="w-3 h-3" /> SYNCED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                        <span className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider font-semibold">
                          {workout.completedAt
                            ? new Date(workout.completedAt).toLocaleDateString() ===
                              new Date().toLocaleDateString()
                              ? "TODAY"
                              : new Date(workout.completedAt)
                                  .toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                  })
                                  .toUpperCase()
                            : "TODAY"}
                        </span>
                        <button
                          onClick={() => {
                            const workoutId = workout.planId || workout.id;
                            if (workoutId) {
                              navigate(`/workout/${workoutId}`);
                            } else {
                              navigate("/my-plans");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>REPEAT</span>
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </AuthGuard>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
