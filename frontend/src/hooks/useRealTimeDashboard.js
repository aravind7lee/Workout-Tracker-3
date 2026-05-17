// Real-Time Dashboard Hook - Instant Updates
import { useState, useEffect, useCallback } from "react";
import { realTimePlanService } from "../services/realTimePlanService";
import { onlineService } from "../services/onlineService";

export const useRealTimeDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalPlans: 0,
    totalWorkouts: 0,
    totalMeals: 0,
    currentStreak: 0,
    xpPoints: 0,
    weeklyGoal: { completed: 0, target: 4, percentage: 0 },
    isRealTime: false,
    lastSync: null,
    loading: true,
  });

  const [planStats, setPlanStats] = useState({
    totalPlans: 0,
    syncedPlans: 0,
    unsyncedPlans: 0,
    categories: [],
    isOnline: false,
  });

  const [recentPlans, setRecentPlans] = useState([]);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle, syncing, synced, error

  // Load initial dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setDashboardStats((prev) => ({ ...prev, loading: true }));

      // Load real-time stats from MongoDB
      const [stats, plans] = await Promise.all([
        onlineService.getRealTimeStats(),
        realTimePlanService.getPlans(),
      ]);

      // Update dashboard stats with real MongoDB data
      setDashboardStats({
        totalPlans: plans.length,
        totalWorkouts: stats?.totalWorkouts || 0,
        totalMeals: stats?.totalMeals || 0,
        currentStreak: stats?.currentStreak || 0,
        xpPoints: stats?.xpPoints || 0,
        weeklyGoal: stats?.weeklyGoal || {
          completed: 0,
          target: 4,
          percentage: 0,
        },
        isRealTime: stats?.isRealTime || false,
        lastSync: new Date().toISOString(),
        loading: false,
      });

      // Update plan stats
      const planStatsData = realTimePlanService.getPlanStats();
      setPlanStats(planStatsData);

      // Update recent plans (all plans for Show More functionality)
      setRecentPlans(plans);

      console.log(
        "✅ Dashboard data loaded - Plans:",
        plans.length,
        "Workouts:",
        stats?.totalWorkouts || 0,
      );
    } catch (error) {
      console.error("❌ Dashboard load failed:", error);
      setDashboardStats((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Handle real-time plan events
  useEffect(() => {
    const handlePlanCreated = (data) => {
      console.log(
        "🚀 INSTANT Dashboard Update - Plan Created:",
        data.plan.name,
      );

      // INSTANT counter update
      setDashboardStats((prev) => ({
        ...prev,
        totalPlans: prev.totalPlans + 1,
        lastSync: new Date().toISOString(),
      }));

      // INSTANT plan stats update
      setPlanStats((prev) => ({
        ...prev,
        totalPlans: prev.totalPlans + 1,
        unsyncedPlans: data.plan.synced
          ? prev.unsyncedPlans
          : prev.unsyncedPlans + 1,
        syncedPlans: data.plan.synced ? prev.syncedPlans + 1 : prev.syncedPlans,
      }));

      // INSTANT recent plans update
      setRecentPlans((prev) => [data.plan, ...prev]);
    };

    const handlePlanDeleted = (data) => {
      console.log("🗑️ INSTANT Dashboard Update - Plan Deleted:", data.planId);

      // INSTANT counter update
      setDashboardStats((prev) => ({
        ...prev,
        totalPlans: Math.max(0, prev.totalPlans - 1),
        lastSync: new Date().toISOString(),
      }));

      // INSTANT plan stats update
      setPlanStats((prev) => ({
        ...prev,
        totalPlans: Math.max(0, prev.totalPlans - 1),
        syncedPlans: data.plan.synced
          ? Math.max(0, prev.syncedPlans - 1)
          : prev.syncedPlans,
        unsyncedPlans: data.plan.synced
          ? prev.unsyncedPlans
          : Math.max(0, prev.unsyncedPlans - 1),
      }));

      // INSTANT recent plans update
      setRecentPlans((prev) => prev.filter((p) => p.id !== data.planId));
    };

    const handlePlanSynced = (data) => {
      console.log(
        "☁️ INSTANT Dashboard Update - Plan Synced:",
        data.realPlan.name,
      );

      // Update plan stats for sync
      setPlanStats((prev) => ({
        ...prev,
        syncedPlans: prev.syncedPlans + 1,
        unsyncedPlans: Math.max(0, prev.unsyncedPlans - 1),
      }));

      // Update recent plans with synced data
      setRecentPlans((prev) =>
        prev.map((p) => (p.id === data.tempId ? data.realPlan : p)),
      );
    };

    const handleSyncComplete = (data) => {
      console.log(
        "✅ INSTANT Dashboard Update - Sync Complete:",
        data.planCount,
        "plans",
      );
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 3000);
    };

    // Listen to real-time plan service events
    realTimePlanService.on("planCreated", handlePlanCreated);
    realTimePlanService.on("planDeleted", handlePlanDeleted);
    realTimePlanService.on("planSynced", handlePlanSynced);
    realTimePlanService.on("syncComplete", handleSyncComplete);

    // Listen to custom dashboard events
    const handleDashboardUpdate = (event) => {
      const { type, plan, planCount, instant } = event.detail;

      if (!instant) return; // Only handle instant updates

      console.log("⚡ INSTANT Dashboard Event:", type);

      switch (type) {
        case "planCreated":
          // Already handled by plan service events
          break;
        case "planDeleted":
          // Already handled by plan service events
          break;
        case "syncComplete":
          setDashboardStats((prev) => ({
            ...prev,
            totalPlans: planCount,
            lastSync: new Date().toISOString(),
          }));
          break;
        default:
          break;
      }
    };

    window.addEventListener("dashboardUpdate", handleDashboardUpdate);

    return () => {
      realTimePlanService.off("planCreated", handlePlanCreated);
      realTimePlanService.off("planDeleted", handlePlanDeleted);
      realTimePlanService.off("planSynced", handlePlanSynced);
      realTimePlanService.off("syncComplete", handleSyncComplete);
      window.removeEventListener("dashboardUpdate", handleDashboardUpdate);
    };
  }, []);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Manual refresh function
  const refreshDashboard = useCallback(async () => {
    setSyncStatus("syncing");
    try {
      await loadDashboardData();
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 5000);
    }
  }, [loadDashboardData]);

  // Force sync function
  const forceSync = useCallback(async () => {
    setSyncStatus("syncing");
    try {
      const result = await realTimePlanService.forceSync();
      if (result.success) {
        await loadDashboardData();
        setSyncStatus("synced");
        setTimeout(() => setSyncStatus("idle"), 3000);
        return { success: true };
      } else {
        setSyncStatus("error");
        setTimeout(() => setSyncStatus("idle"), 5000);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 5000);
      return { success: false, error: error.message };
    }
  }, [loadDashboardData]);

  // Get current sync status
  const getCurrentSyncStatus = useCallback(() => {
    return realTimePlanService.getSyncStatus();
  }, []);

  return {
    // Dashboard stats
    dashboardStats,
    planStats,
    recentPlans,

    // Sync status
    syncStatus,

    // Actions
    refreshDashboard,
    forceSync,
    getCurrentSyncStatus,

    // Real-time indicators
    isOnline: planStats.isOnline,
    isRealTime: dashboardStats.isRealTime,
    lastSync: dashboardStats.lastSync,
  };
};
