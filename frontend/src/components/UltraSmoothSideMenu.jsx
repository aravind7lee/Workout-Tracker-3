// Ultra-Optimized Side Menu for Mobile Performance
import { User, Menu, X, Settings, LogOut, UserCircle, Zap, Home, BarChart3, Dumbbell, Calendar, Apple, TrendingUp, Target, Award, Clock, Wifi, WifiOff, LayoutDashboard } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import { useConnectionStatus } from "../services/connectionService";
import logo from "../assets/logo.png";

const menuItems = [
  { to: "/", label: "Home", icon: Home, color: "#FF0000" },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "#FF0000" },
  { to: "/library", label: "Library", icon: Dumbbell, color: "#8B0000" },
  { to: "/my-plans", label: "My Plans", icon: Calendar, color: "#00ff88" },
  { to: "/plans", label: "Plan Builder", icon: Target, color: "#ff6b6b" },
  { to: "/splits", label: "Splits", icon: BarChart3, color: "#ff9500" },
  { to: "/nutrition", label: "Nutrition", icon: Apple, color: "#ffa502" },
  { to: "/analytics", label: "Analytics", icon: TrendingUp, color: "#FF0000" },
];

export default function UltraSmoothSideMenu({ isOpen, setIsOpen }) {
  const [mounted, setMounted] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const connectionStatus = useConnectionStatus();

  const sidebarRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ultra-optimized scroll lock with performance boost
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  // Optimized click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside, {
        passive: true,
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Simplified keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown, { passive: true });
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
    setShowProfileDropdown(false);
    setIsOpen(false);
  }, [logout, navigate, setIsOpen]);

  const isActiveRoute = useCallback(
    (path) => {
      return location.pathname === path;
    },
    [location.pathname],
  );

  const handleMenuItemClick = useCallback(
    (path) => {
      setIsOpen(false);
      navigate(path);
    },
    [setIsOpen, navigate],
  );

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 26,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with framer-motion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-[6px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Premium Glassmorphic Sidebar with framer-motion */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed top-0 right-0 h-screen w-[280px] sm:w-[320px] max-w-[85vw] z-[70] overflow-y-auto overflow-x-hidden bg-black/95 backdrop-blur-3xl border-l border-neutral-900/90 shadow-2xl flex flex-col [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              willChange: "transform",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="relative h-full flex flex-col">
              {/* Header Section */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-900/60 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleMenuItemClick("/")}
                    className="hover:opacity-90 transition-opacity active:scale-95 flex-shrink-0"
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(255,0,0,0.2))",
                    }}
                  >
                    <img
                      src={logo}
                      alt="GymTracker"
                      className="h-8 w-auto object-contain"
                      loading="eager"
                      decoding="async"
                    />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-white font-heading tracking-wider">
                      GRIND-X
                    </h2>
                    <div className="flex items-center space-x-1.5 mt-0.5 bg-[#FF0000]/10 border border-[#FF0000]/20 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] animate-pulse" />
                      <span className="text-[9px] font-bold text-[#FF0000] tracking-wider uppercase font-body">
                        {connectionStatus.mode}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-neutral-900/50 hover:bg-[#FF0000]/10 border border-neutral-900 hover:border-[#FF0000]/20 text-neutral-400 hover:text-[#FF0000] transition-all duration-300 active:scale-90"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col justify-between">
                {/* Upper block with menu items */}
                <div>
                  {/* Navigation Menu */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-1.5 mb-6"
                  >
                    {menuItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.to);

                      return (
                        <motion.div key={item.to} variants={itemVariants}>
                          <button
                            onClick={() => handleMenuItemClick(item.to)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-300 group ${
                              isActive
                                ? "bg-gradient-to-r from-[#FF0000]/15 to-transparent text-white border-l-[3px] border-[#FF0000] pl-[9px]"
                                : "text-neutral-400 hover:text-white hover:bg-neutral-900/30 border-l-[3px] border-transparent pl-[9px]"
                            }`}
                          >
                            {/* Icon with beautiful wrapper */}
                            <div
                              className={`p-2 rounded-lg transition-all duration-300 ${
                                isActive
                                  ? "bg-[#FF0000]/15 text-[#FF0000]"
                                  : "bg-neutral-950/60 text-neutral-400 group-hover:text-white group-hover:bg-neutral-900"
                              }`}
                            >
                              <Icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
                            </div>

                            {/* Label */}
                            <span className="font-semibold font-body text-sm">
                              {item.label}
                            </span>

                            {/* Active dot */}
                            {isActive && (
                              <motion.div
                                layoutId="activeSideDot"
                                className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF0000]"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                          </button>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>

                {/* Lower block with Profile / Auth + Motivation Quote */}
                <div className="space-y-4">
                  {/* Profile Section - Inside scrollable area */}
                  {isAuthenticated() && user ? (
                    <div className="border-t border-neutral-900/60 pt-4 mt-2 px-1">
                      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F0F0F] via-[#080808] to-[#0A0A0A] border border-neutral-900/80 rounded-2xl p-4 shadow-xl">
                        {/* Premium glow decorative circle */}
                        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#FF0000]/5 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="relative">
                            {user?.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover border-2 border-[#FF0000]/20 shadow-md shadow-[#FF0000]/10"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF0000] to-[#B30000] flex items-center justify-center text-white font-bold shadow-md shadow-[#FF0000]/20">
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                            )}
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-white text-sm font-semibold truncate font-body">
                              {user?.name || "User"}
                            </h3>
                            <p className="text-neutral-500 text-xs truncate font-body">
                              {user?.email || ""}
                            </p>
                            <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 uppercase tracking-wider font-body">
                              Premium Athlete
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-neutral-900/60">
                          <button
                            onClick={() => handleMenuItemClick("/profile")}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900/40 transition-all duration-200"
                          >
                            <UserCircle size={16} className="text-neutral-500" />
                            <span className="text-xs font-semibold font-body">My Account</span>
                          </button>

                          <button
                            onClick={() => handleMenuItemClick("/settings")}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900/40 transition-all duration-200"
                          >
                            <Settings size={16} className="text-neutral-500" />
                            <span className="text-xs font-semibold font-body">Settings</span>
                          </button>

                          <div className="pt-2 border-t border-neutral-900/60 mt-2">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-red-950/20 to-transparent hover:from-[#FF0000]/10 hover:bg-[#FF0000]/5 text-[#FF0000] hover:text-[#E60000] border border-[#FF0000]/15 hover:border-[#FF0000]/30 transition-all duration-300 shadow-sm"
                            >
                              <LogOut size={16} />
                              <span className="text-xs font-bold font-body uppercase tracking-wider">
                                Log out
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-neutral-900/60 pt-4 mt-2 px-1">
                      <div className="space-y-2.5">
                        <button
                          onClick={() => handleMenuItemClick("/login")}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-[#0D0D0D] border border-neutral-800 hover:bg-[#1A1A1A] text-white min-h-[44px] shadow-lg transition-all duration-200"
                        >
                          <User size={16} />
                          <span className="font-semibold text-xs font-body">Login</span>
                        </button>

                        <button
                          onClick={() => handleMenuItemClick("/register")}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#FF0000] to-[#B30000] hover:from-[#E60000] hover:to-[#8B0000] text-white border border-[#FF0000]/20 min-h-[44px] shadow-lg shadow-[#FF0000]/10 transition-all duration-300"
                        >
                          <Zap size={16} />
                          <span className="font-semibold text-xs font-body">Sign Up</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fitness Motivation Card */}
                  <div className="px-1">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A0A0A] via-[#050505] to-[#080808] border border-neutral-900/80 p-4 shadow-xl">
                      {/* Decorative background glow */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF0000]/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-[#FF0000]/10 text-[#FF0000] mt-0.5">
                          <Zap size={15} className="animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider font-body">
                            Daily Grind
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-1 font-body leading-relaxed italic">
                            "The pain you feel today will be the strength you feel tomorrow. Grind harder."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom padding for scroll */}
                <div className="h-2"></div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
