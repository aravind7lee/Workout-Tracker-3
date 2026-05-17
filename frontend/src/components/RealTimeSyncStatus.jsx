// Real-time Sync Status Component
import { Smartphone, RefreshCw, AlertTriangle, Hourglass, CheckCircle2, Lock } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { onlineService, planSyncService } from "../services/onlineService";
import { useAuth } from "../context/AuthContext";


export default function RealTimeSyncStatus() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingChanges: 0,
    syncInProgress: false,
    error: null,
  });
  useEffect(() => {
    // Initialize sync status
    updateSyncStatus();

    // Start real-time sync if user is logged in
    if (user) {
      planSyncService.startRealTimeSync();
    }

    // Listen for network changes
    const handleOnline = () => {
      setSyncStatus((prev) => ({
        ...prev,
        isOnline: true,
        error: null,
      }));
      if (user) {
        performSync();
      }
    };
    const handleOffline = () => {
      setSyncStatus((prev) => ({
        ...prev,
        isOnline: false,
      }));
    };

    // Listen for sync events
    const handleSyncComplete = (event) => {
      setSyncStatus((prev) => ({
        ...prev,
        lastSync: new Date(),
        syncInProgress: false,
        error: null,
        pendingChanges: 0,
      }));
    };
    const handleSyncError = (event) => {
      setSyncStatus((prev) => ({
        ...prev,
        syncInProgress: false,
        error: event.detail?.error || "Sync failed",
      }));
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offlineDataSynced", handleSyncComplete);
    window.addEventListener("syncError", handleSyncError);

    // Check for pending changes periodically
    const pendingInterval = setInterval(updatePendingChanges, 5000);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offlineDataSynced", handleSyncComplete);
      window.removeEventListener("syncError", handleSyncError);
      clearInterval(pendingInterval);
      if (user) {
        planSyncService.stopRealTimeSync();
      }
    };
  }, [user]);
  const updateSyncStatus = () => {
    const lastSyncStr = localStorage.getItem("lastSyncTime");
    const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;
    setSyncStatus((prev) => ({
      ...prev,
      lastSync,
      isOnline: navigator.onLine,
    }));
  };
  const updatePendingChanges = () => {
    const localPlans = JSON.parse(localStorage.getItem("workoutPlans") || "[]");
    const pendingDeletes = JSON.parse(
      localStorage.getItem("pendingPlanDeletes") || "[]",
    );
    const offlineData = JSON.parse(
      localStorage.getItem("gymTracker_offlineData") || "{}",
    );
    const unsyncedPlans = localPlans.filter(
      (p) => !p.synced && !p.backendId,
    ).length;
    const pendingDeletesCount = pendingDeletes.length;
    const offlineWorkouts = offlineData.workouts?.length || 0;
    const offlineMeals = offlineData.meals?.length || 0;
    const totalPending =
      unsyncedPlans + pendingDeletesCount + offlineWorkouts + offlineMeals;
    setSyncStatus((prev) => ({
      ...prev,
      pendingChanges: totalPending,
    }));
  };
  const performSync = async () => {
    if (!user || !syncStatus.isOnline || syncStatus.syncInProgress) return;
    setSyncStatus((prev) => ({
      ...prev,
      syncInProgress: true,
      error: null,
    }));
    try {
      const result = await planSyncService.forceSync();
      if (result.success) {
        localStorage.setItem("lastSyncTime", new Date().toISOString());
        setSyncStatus((prev) => ({
          ...prev,
          lastSync: new Date(),
          syncInProgress: false,
          error: null,
          pendingChanges: 0,
        }));
      } else {
        setSyncStatus((prev) => ({
          ...prev,
          syncInProgress: false,
          error: result.error || "Sync failed",
        }));
      }
    } catch (error) {
      setSyncStatus((prev) => ({
        ...prev,
        syncInProgress: false,
        error: error.message,
      }));
    }
  };
  const formatLastSync = (date) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };
  const getSyncStatusColor = () => {
    if (!syncStatus.isOnline) return "text-red-400";
    if (syncStatus.syncInProgress) return "text-red-500";
    if (syncStatus.error) return "text-red-400";
    if (syncStatus.pendingChanges > 0) return "text-yellow-400";
    return "text-red-500";
  };
  const getSyncStatusIcon = () => {
    if (!syncStatus.isOnline) return "📱";
    if (syncStatus.syncInProgress) return "🔄";
    if (syncStatus.error) return "⚠️";
    if (syncStatus.pendingChanges > 0) return "⏳";
    return "✅";
  };
  const getSyncStatusText = () => {
    if (!syncStatus.isOnline) return "Offline Mode";
    if (syncStatus.syncInProgress) return "Syncing...";
    if (syncStatus.error) return "Sync Error";
    if (syncStatus.pendingChanges > 0)
      return `${syncStatus.pendingChanges} Pending`;
    return "All Synced";
  };
  if (!user) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "flex items-center gap-2 text-xs text-neutral-400",
      },
      /*#__PURE__*/ React.createElement(
        "span",
        null,
        /*#__PURE__*/ React.createElement(Lock, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      ),
      /*#__PURE__*/ React.createElement(
        "span",
        null,
        "Login to enable real-time sync",
      ),
    );
  }
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "flex items-center gap-2 text-xs",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "flex items-center gap-1",
      },
      /*#__PURE__*/ React.createElement(
        "span",
        {
          className: getSyncStatusColor(),
        },
        getSyncStatusIcon(),
      ),
      /*#__PURE__*/ React.createElement(
        "span",
        {
          className: getSyncStatusColor(),
        },
        getSyncStatusText(),
      ),
    ),
    syncStatus.lastSync &&
      /*#__PURE__*/ React.createElement(
        "span",
        {
          className: "text-neutral-500",
        },
        "\u2022 ",
        formatLastSync(syncStatus.lastSync),
      ),
    syncStatus.isOnline &&
      !syncStatus.syncInProgress &&
      /*#__PURE__*/ React.createElement(
        "button",
        {
          onClick: performSync,
          className: "text-red-500 hover:text-blue-300 transition-colors",
          title: "Force sync now",
        },
        /*#__PURE__*/ React.createElement(RefreshCw, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      ),
    syncStatus.error &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-red-400",
          title: syncStatus.error,
        },
        /*#__PURE__*/ React.createElement(AlertTriangle, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      ),
    syncStatus.syncInProgress &&
      /*#__PURE__*/ React.createElement("div", {
        className:
          "animate-spin w-3 h-3 border border-red-500 border-t-transparent rounded-full",
      }),
  );
}
