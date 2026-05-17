// frontend/src/pages/MyPlans.jsx - REAL-TIME MONGODB INTEGRATION
import { Lock, Rocket, Trash2, Cloud, CheckCircle2, XCircle, RefreshCw, ClipboardList, BicepsFlexed, Search, Key, Star, Calendar, Dumbbell, Pencil } from 'lucide-react';
import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PlanDetailsModal from "../components/PlanDetailsModal";
import WorkoutPlanBuilderHeader from "../components/WorkoutPlanBuilderHeader";
import AuthGuard from "../components/AuthGuard";
import { realTimePlanService } from "../services/realTimePlanService";
import { useAuth } from "../context/AuthContext";


export default function MyPlans() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get("search") || "";
  const highlightPlan = searchParams.get("highlight") || "";
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchQuery, setSearchQuery] = useState(navbarSearch);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [lastSync, setLastSync] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    isOnline: false,
    totalPlans: 0,
  });
  const [expandedPlans, setExpandedPlans] = useState({});

  // Filter plans based on search
  const filteredPlans = useMemo(() => {
    if (!searchQuery) return savedPlans;
    return savedPlans.filter(
      (plan) =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.exercises.some((exercise) =>
          exercise.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
  }, [savedPlans, searchQuery]);

  // Update search when navbar search parameter changes
  useEffect(() => {
    if (navbarSearch && navbarSearch !== searchQuery) {
      setSearchQuery(navbarSearch);
    }
  }, [navbarSearch]);

  // Real-time data loading with instant updates - USER SPECIFIC
  useEffect(() => {
    if (!user) {
      console.log("🔒 No authenticated user - clearing plans");
      setSavedPlans([]);
      setLoading(false);
      return;
    }

    // Clean fake plans on mount
    const cleanFakePlans = () => {
      try {
        const allPlans = JSON.parse(
          localStorage.getItem("workoutPlans") || "[]",
        );
        const userPlans = allPlans.filter(
          (plan) => plan.userId === user.id || plan.userId === user._id,
        );
        if (userPlans.length !== allPlans.length) {
          localStorage.setItem("workoutPlans", JSON.stringify(userPlans));
          console.log(
            `🧹 Cleaned plans: ${allPlans.length} → ${userPlans.length}`,
          );
        }
      } catch (error) {
        console.warn("Error cleaning fake plans:", error);
      }
    };
    cleanFakePlans();
    loadRealTimePlans();

    // Listen for real-time plan events
    const handlePlanCreated = (data) => {
      console.log("🚀 My Plans - Plan Created:", data.plan.name);
      setSavedPlans((prev) => [data.plan, ...prev]);
      updateRealTimeStats();
    };
    const handlePlanDeleted = (data) => {
      console.log("🗑️ My Plans - Plan Deleted:", data.planId);
      setSavedPlans((prev) => prev.filter((p) => p.id !== data.planId));
      updateRealTimeStats();
    };
    const handlePlanSynced = (data) => {
      console.log("☁️ My Plans - Plan Synced:", data.realPlan.name);
      setSavedPlans((prev) =>
        prev.map((p) => (p.id === data.tempId ? data.realPlan : p)),
      );
      updateRealTimeStats();
    };
    const handleSyncComplete = () => {
      console.log("✅ My Plans - Sync Complete");
      loadRealTimePlans();
    };

    // Subscribe to real-time events
    realTimePlanService.on("planCreated", handlePlanCreated);
    realTimePlanService.on("planDeleted", handlePlanDeleted);
    realTimePlanService.on("planSynced", handlePlanSynced);
    realTimePlanService.on("syncComplete", handleSyncComplete);
    return () => {
      realTimePlanService.off("planCreated", handlePlanCreated);
      realTimePlanService.off("planDeleted", handlePlanDeleted);
      realTimePlanService.off("planSynced", handlePlanSynced);
      realTimePlanService.off("syncComplete", handleSyncComplete);
    };
  }, [user]);
  useEffect(() => {
    loadRealTimePlans();
  }, [highlightPlan]);
  const loadRealTimePlans = async () => {
    if (!user) {
      console.log("🔒 No authenticated user - cannot load plans");
      setSavedPlans([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSyncStatus("syncing");
    try {
      console.log(`🚀 Loading USER-SPECIFIC plans for ${user.id}...`);

      // Load plans using real-time service (already user-filtered)
      const plans = await realTimePlanService.getPlans();

      // STRICT user filtering - only plans with matching userId
      const userPlans = plans.filter((plan) => {
        const belongsToUser =
          plan.userId === user.id || plan.userId === user._id;
        if (!belongsToUser) {
          console.log(
            `🗑️ Filtering out plan: "${plan.name}" (userId: ${plan.userId}, user: ${user.id})`,
          );
        }
        return belongsToUser;
      });
      setSavedPlans(userPlans);

      // Update real-time stats
      updateRealTimeStats();
      setLastSync(new Date());
      setSyncStatus("synced");
      console.log(
        `✅ USER-SPECIFIC plans loaded for ${user.id}:`,
        userPlans.length,
      );

      // Auto-hide sync status
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      console.error("❌ Failed to load user-specific plans:", error);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 5000);
    } finally {
      setLoading(false);
    }
  };
  const updateRealTimeStats = () => {
    const stats = realTimePlanService.getPlanStats();
    setRealTimeStats(stats);
  };
  const syncPlansWithBackend = async () => {
    if (!user) return;
    setSyncStatus("syncing");
    try {
      console.log("🔄 Force syncing all plans...");
      const result = await realTimePlanService.forceSync();
      if (result.success) {
        // Reload plans after sync
        const plans = await realTimePlanService.getPlans(true);
        setSavedPlans(plans);
        updateRealTimeStats();
        setLastSync(new Date());
        setSyncStatus("synced");
        console.log("✅ Force sync completed:", result.planCount, "plans");
      } else {
        throw new Error(result.error || "Sync failed");
      }

      // Auto-hide sync status after 3 seconds
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      console.error("❌ Sync failed:", error);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 5000);
    }
  };
  const deletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        console.log("🗑️ Deleting plan with REAL-TIME update:", planId);

        // Use real-time service for instant deletion
        const success = await realTimePlanService.deletePlan(planId);
        if (success) {
          console.log("✅ Plan deleted with REAL-TIME dashboard update");
        } else {
          throw new Error("Failed to delete plan");
        }
      } catch (error) {
        console.error("❌ Error deleting plan:", error);
        alert("Failed to delete plan. Please try again.");
      }
    }
  };
  const duplicatePlan = async (plan) => {
    try {
      console.log("📋 Duplicating plan with REAL-TIME update:", plan.name);

      // Use real-time service for instant duplication
      const duplicatedPlan = await realTimePlanService.duplicatePlan(plan);
      if (duplicatedPlan) {
        console.log(
          "✅ Plan duplicated with REAL-TIME dashboard update:",
          duplicatedPlan.name,
        );
      } else {
        throw new Error("Failed to duplicate plan");
      }
    } catch (error) {
      console.error("❌ Error duplicating plan:", error);
      alert("Failed to duplicate plan. Please try again.");
    }
  };
  return /*#__PURE__*/ React.createElement(
    AuthGuard,
    null,
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "workout-builder-section",
      },
      /*#__PURE__*/ React.createElement(WorkoutPlanBuilderHeader, null),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          id: "plans-content",
          className:
            "px-2.5 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-3 xs:py-4 sm:py-5 md:py-6 space-y-2.5 xs:space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-gradient-to-r from-black via-neutral-900 to-black border border-neutral-800/50 rounded-lg p-2.5 xs:p-3 sm:p-4 md:p-5 lg:p-6 relative overflow-hidden group",
          },
          /*#__PURE__*/ React.createElement("div", {
            className:
              "absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          }),
          /*#__PURE__*/ React.createElement("div", {
            className:
              "absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent",
          }),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "space-y-3",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center justify-between relative z-10",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-1.5 xs:gap-2 sm:gap-2.5",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 relative overflow-hidden group",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className:
                      "absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-sm xs:text-base sm:text-lg md:text-xl relative z-10",
                    },
                    /*#__PURE__*/ React.createElement(BicepsFlexed, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "h2",
                    {
                      className:
                        "text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-black text-white uppercase tracking-wide leading-none",
                    },
                    "My Workout Plans",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className:
                        "text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-neutral-400 font-medium uppercase tracking-wider mt-0.5",
                    },
                    "Professional Gym Tracking",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: syncPlansWithBackend,
                  disabled: syncStatus === "syncing",
                  className:
                    "p-1.5 xs:p-2 sm:p-2.5 bg-neutral-800/50 hover:bg-neutral-700/60 text-neutral-300 hover:text-white rounded-md text-[10px] xs:text-xs sm:text-sm transition-all duration-200 active:scale-95 border border-neutral-700/30 shadow-lg",
                },
                /*#__PURE__*/ React.createElement(RefreshCw, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center justify-between bg-neutral-900/50 rounded-lg p-2 xs:p-2.5 sm:p-3 border border-neutral-700/50 relative z-10 overflow-hidden group",
              },
              /*#__PURE__*/ React.createElement("div", {
                className:
                  "absolute inset-0 bg-gradient-to-r from-red-600/5 via-red-600/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center gap-2 xs:gap-2.5 sm:gap-3 relative z-10",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-1",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className:
                      "w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-black text-green-300 uppercase tracking-wider",
                    },
                    "REAL-TIME",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-2 xs:gap-3 sm:gap-4",
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
                          "text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-black text-white leading-none",
                      },
                      realTimeStats.totalPlans,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-neutral-400 font-medium uppercase tracking-wide mt-0.5",
                      },
                      "Total",
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "hidden xs:inline",
                        },
                        " Plans",
                      ),
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
                        className:
                          "text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-black text-red-500 leading-none",
                      },
                      realTimeStats.syncedPlans || 0,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-neutral-400 font-medium uppercase tracking-wide mt-0.5",
                      },
                      "Synced",
                    ),
                  ),
                ),
              ),
              syncStatus !== "idle" &&
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-[9px] xs:text-[10px] sm:text-xs text-green-300 flex items-center gap-1 font-bold uppercase tracking-wide relative z-10",
                  },
                  /*#__PURE__*/ React.createElement("span", null, "\u2713"),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "hidden sm:inline",
                    },
                    "Synced",
                  ),
                ),
            ),
            /*#__PURE__*/ React.createElement(
              Link,
              {
                to: "/plans",
                className:
                  "w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 rounded-lg font-black text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg flex items-center justify-center gap-1.5 xs:gap-2 uppercase tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/30 relative overflow-hidden group relative z-10",
              },
              /*#__PURE__*/ React.createElement("div", {
                className:
                  "absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700",
              }),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-sm xs:text-base sm:text-lg relative z-10",
                },
                "+",
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "relative z-10",
                },
                "Create New Plan",
              ),
            ),
          ),
        ),
        (savedPlans.length > 0 || searchQuery) &&
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "relative",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "relative group",
              },
              /*#__PURE__*/ React.createElement("input", {
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className:
                  "w-full p-2 xs:p-2.5 sm:p-3 pl-7 xs:pl-8 sm:pl-9 pr-7 xs:pr-8 sm:pr-9 rounded-lg bg-neutral-900/60 border border-neutral-700/50 hover:border-orange-500/30 focus:border-orange-500/50 text-white placeholder-neutral-400 text-[10px] xs:text-xs sm:text-sm md:text-base transition-all duration-200 shadow-lg focus:shadow-orange-500/20 focus:outline-none",
                placeholder: "Search your plans...",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute left-2 xs:left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-hover:text-orange-400 transition-colors duration-200",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-xs xs:text-sm sm:text-base",
                  },
                  /*#__PURE__*/ React.createElement(Search, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
              ),
              searchQuery &&
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: () => setSearchQuery(""),
                    className:
                      "absolute right-2 xs:right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-red-400 text-[10px] xs:text-xs sm:text-sm p-1 transition-all duration-200 active:scale-90 font-bold",
                  },
                  "\u2715",
                ),
            ),
          ),
        searchQuery && filteredPlans.length === 0 && savedPlans.length > 0
          ? /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "bg-gradient-to-br from-neutral-900/60 via-neutral-900/40 to-black/60 border border-neutral-800/50 rounded-2xl p-6 xs:p-8 sm:p-10 md:p-12 text-center shadow-2xl backdrop-blur-sm relative overflow-hidden group",
              },
              /*#__PURE__*/ React.createElement("div", {
                className:
                  "absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 xs:mb-5 sm:mb-6 shadow-lg shadow-orange-500/30 relative z-10",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-3xl xs:text-4xl sm:text-5xl",
                  },
                  /*#__PURE__*/ React.createElement(Search, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "h3",
                {
                  className:
                    "text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 xs:mb-3 uppercase tracking-wide leading-none relative z-10",
                },
                "No Plans Found",
              ),
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className:
                    "text-neutral-400 mb-6 xs:mb-8 max-w-md mx-auto text-[10px] xs:text-xs sm:text-sm md:text-base font-medium relative z-10",
                },
                'No plans match "',
                searchQuery,
                '". Try a different search term or create a new plan.',
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex flex-col sm:flex-row gap-2 xs:gap-3 justify-center relative z-10",
                },
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: () => setSearchQuery(""),
                    className:
                      "px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 bg-neutral-800/50 hover:bg-neutral-700/60 border border-neutral-700/50 text-neutral-300 hover:text-white rounded-xl font-black text-[10px] xs:text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 xs:gap-2 uppercase tracking-wide active:scale-95 shadow-lg",
                  },
                  /*#__PURE__*/ React.createElement("span", null, "\u2715"),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    null,
                    "Clear Search",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  Link,
                  {
                    to: "/plans",
                    className:
                      "px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-black text-[10px] xs:text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 xs:gap-2 shadow-lg shadow-orange-500/30 uppercase tracking-wide active:scale-95 relative overflow-hidden group/btn",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className:
                      "absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "relative z-10",
                    },
                    "+",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "relative z-10",
                    },
                    "Create New Plan",
                  ),
                ),
              ),
            )
          : savedPlans.length === 0
            ? /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "bg-neutral-900/60 border border-neutral-800/50 rounded-lg p-4 xs:p-5 sm:p-6 text-center relative overflow-hidden group",
                },
                /*#__PURE__*/ React.createElement("div", {
                  className:
                    "absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                }),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-3 xs:mb-4 shadow-lg shadow-orange-500/30 relative z-10",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-xl xs:text-2xl sm:text-3xl",
                    },
                    user ? <BicepsFlexed className="w-[1em] h-[1em] inline-block"/> : <Lock className="w-[1em] h-[1em] inline-block"/>,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "h3",
                  {
                    className:
                      "text-sm xs:text-base sm:text-lg md:text-xl font-black text-white mb-2 uppercase tracking-wide leading-none relative z-10",
                  },
                  user ? "Ready to Start Training?" : "Login Required",
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className:
                      "text-neutral-400 mb-3 xs:mb-4 text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-medium relative z-10",
                  },
                  user
                    ? "Create your first professional workout plan and start your fitness journey."
                    : "Please login to access your personal workout plans.",
                ),
                user
                  ? /*#__PURE__*/ React.createElement(
                      Link,
                      {
                        to: "/plans",
                        className:
                          "inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-black text-[9px] xs:text-[10px] sm:text-xs md:text-sm uppercase tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/30 relative z-10 overflow-hidden group/btn",
                      },
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700",
                      }),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "relative z-10",
                        },
                        "+",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "relative z-10",
                        },
                        "Create Your First Plan",
                      ),
                    )
                  : /*#__PURE__*/ React.createElement(
                      Link,
                      {
                        to: "/login",
                        className:
                          "inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-purple-700 text-white rounded-lg font-black text-[9px] xs:text-[10px] sm:text-xs md:text-sm uppercase tracking-wide transition-all duration-200 active:scale-95 shadow-lg relative z-10",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "relative z-10",
                        },
                        /*#__PURE__*/ React.createElement(Key, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "relative z-10",
                        },
                        "Login to View Plans",
                      ),
                    ),
              )
            : /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 xs:gap-3 sm:gap-3.5 md:gap-4",
                },
                filteredPlans.map((plan) =>
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      key: plan.id,
                      className:
                        "bg-neutral-900/60 border border-neutral-800/50 hover:border-orange-500/50 rounded-lg p-2.5 xs:p-3 sm:p-3.5 md:p-4 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 relative overflow-hidden group",
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      className:
                        "absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "flex items-center justify-between mb-2 xs:mb-2.5 relative z-10",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex items-center gap-1",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className:
                              "text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-black text-yellow-300 bg-yellow-900/40 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded border border-yellow-500/50 uppercase tracking-wide shadow-lg",
                          },
                          /*#__PURE__*/ React.createElement(Star, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " Local",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex items-center gap-0.5 xs:gap-1",
                        },
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => duplicatePlan(plan),
                            className:
                              "p-1 xs:p-1.5 text-neutral-400 hover:text-blue-300 rounded transition-all duration-200 active:scale-90 hover:bg-red-600/10",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-xs xs:text-sm sm:text-base",
                            },
                            /*#__PURE__*/ React.createElement(ClipboardList, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => deletePlan(plan.id),
                            className:
                              "p-1 xs:p-1.5 text-neutral-400 hover:text-red-300 rounded transition-all duration-200 active:scale-90 hover:bg-red-500/10",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-xs xs:text-sm sm:text-base",
                            },
                            /*#__PURE__*/ React.createElement(Trash2, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                          ),
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "mb-2.5 xs:mb-3 relative z-10",
                      },
                      /*#__PURE__*/ React.createElement(
                        "h3",
                        {
                          className:
                            "text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-black text-white mb-1 xs:mb-1.5 truncate uppercase tracking-wide leading-none",
                        },
                        plan.name,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "flex items-center gap-1.5 xs:gap-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-medium",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-neutral-300",
                          },
                          plan.exercises.length,
                          " ",
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "hidden xs:inline",
                            },
                            "exercises",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "xs:hidden",
                            },
                            "ex",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-neutral-500",
                          },
                          "\u2022",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className:
                              "text-orange-400 font-bold uppercase tracking-wide",
                          },
                          plan.category || "General",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-neutral-500",
                          },
                          "\u2022",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-neutral-400",
                          },
                          /*#__PURE__*/ React.createElement(ClipboardList, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "space-y-1.5 xs:space-y-2 mb-2.5 xs:mb-3 relative z-10",
                      },
                      (expandedPlans[plan.id]
                        ? plan.exercises
                        : plan.exercises.slice(0, 2)
                      ).map((exercise, index) =>
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            key: index,
                            className:
                              "flex items-center gap-1.5 xs:gap-2 p-1.5 xs:p-2 sm:p-2.5 bg-neutral-900/40 border border-neutral-800/30 hover:border-orange-500/30 rounded transition-all duration-200 group/exercise",
                          },
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center text-white font-black text-[8px] xs:text-[9px] sm:text-[10px] shadow-lg shadow-orange-500/20 group-hover/exercise:scale-110 transition-transform duration-200",
                            },
                            index + 1,
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
                                  "text-white font-black text-[9px] xs:text-[10px] sm:text-xs md:text-sm truncate uppercase tracking-wide leading-none",
                              },
                              exercise.name,
                            ),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className:
                                  "text-neutral-400 text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-medium mt-0.5",
                              },
                              exercise.sets,
                            ),
                          ),
                        ),
                      ),
                      plan.exercises.length > 2 &&
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () =>
                              setExpandedPlans((prev) => ({
                                ...prev,
                                [plan.id]: !prev[plan.id],
                              })),
                            className:
                              "w-full text-center py-1.5 xs:py-2 hover:bg-neutral-800/30 rounded transition-all duration-200 active:scale-95",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "text-[9px] xs:text-[10px] sm:text-xs text-orange-400 font-black uppercase tracking-wide",
                            },
                            expandedPlans[plan.id]
                              ? "▲ Show Less"
                              : `+${plan.exercises.length - 2} more`,
                          ),
                        ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-neutral-400 mb-2.5 xs:mb-3 p-1.5 xs:p-2 sm:p-2.5 bg-neutral-900/30 border border-neutral-800/30 rounded font-medium relative z-10",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex items-center gap-1 mb-0.5 xs:mb-1",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          null,
                          /*#__PURE__*/ React.createElement(Calendar, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "hidden xs:inline",
                            },
                            "Created: ",
                          ),
                          new Date(plan.createdAt).toLocaleDateString(),
                        ),
                      ),
                      lastSync &&
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "flex items-center gap-1",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            /*#__PURE__*/ React.createElement(RefreshCw, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "hidden xs:inline",
                              },
                              "Last sync: ",
                            ),
                            lastSync.toLocaleTimeString(),
                          ),
                        ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "space-y-1.5 xs:space-y-2 relative z-10",
                      },
                      /*#__PURE__*/ React.createElement(
                        Link,
                        {
                          to: "/start-workout",
                          state: {
                            workoutPlan: plan,
                          },
                          className:
                            "w-full px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 bg-neutral-800/50 hover:bg-neutral-700/60 text-neutral-300 hover:text-white rounded text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-black text-center flex items-center justify-center gap-1 xs:gap-1.5 uppercase tracking-wide transition-all duration-200 active:scale-95 border border-neutral-700/30 shadow-lg",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-xs xs:text-sm sm:text-base",
                          },
                          /*#__PURE__*/ React.createElement(Dumbbell, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          null,
                          "Start Workout",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        Link,
                        {
                          to: `/edit-plan/${plan.id}`,
                          className:
                            "w-full px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-black text-center flex items-center justify-center gap-1 xs:gap-1.5 uppercase tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/30 relative overflow-hidden group/btn",
                        },
                        /*#__PURE__*/ React.createElement("div", {
                          className:
                            "absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700",
                        }),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className:
                              "text-xs xs:text-sm sm:text-base relative z-10",
                          },
                          /*#__PURE__*/ React.createElement(Pencil, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "relative z-10",
                          },
                          "Edit Plan",
                        ),
                      ),
                    ),
                  ),
                ),
              ),
        selectedPlan &&
          /*#__PURE__*/ React.createElement(PlanDetailsModal, {
            plan: selectedPlan,
            onClose: () => setSelectedPlan(null),
          }),
      ),
    ),
  );
}
