// Optimized Side Menu for GymTracker
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Menu, X, Settings, LogOut, UserCircle, Zap,
  Home, BarChart3, Dumbbell, Calendar, Apple, TrendingUp,
  Target, Award, Clock, Wifi, WifiOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useConnectionStatus } from "../services/connectionService";
import logo from "../assets/logo.png";

// Optimized animation configs for mobile performance
const fastTransition = {
  type: "tween",
  duration: 0.2,
  ease: "easeOut"
};

const smoothTransition = {
  type: "tween",
  duration: 0.15,
  ease: "easeInOut"
};

const menuItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home, color: "#00d4ff" },
  { to: "/library", label: "Library", icon: Dumbbell, color: "#8b5cf6" },
  { to: "/my-plans", label: "My Plans", icon: Calendar, color: "#00ff88" },
  { to: "/plans", label: "Plan Builder", icon: Target, color: "#ff6b6b" },
  { to: "/splits", label: "Splits", icon: BarChart3, color: "#ff9500" },
  { to: "/nutrition", label: "Nutrition", icon: Apple, color: "#ffa502" },
  { to: "/analytics", label: "Analytics", icon: TrendingUp, color: "#00d4ff" },
  { to: "/legends", label: "Champs", icon: Award, color: "#ffd700" },
  { to: "/profile", label: "Profile", icon: UserCircle, color: "#8b5cf6" },
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

  // Simplified scroll lock for better performance
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
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
      document.addEventListener('mousedown', handleClickOutside, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Simplified keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
    setShowProfileDropdown(false);
    setIsOpen(false);
  }, [logout, navigate, setIsOpen]);

  const isActiveRoute = useCallback((path) => {
    return location.pathname === path;
  }, [location.pathname]);

  const handleMenuItemClick = useCallback((path) => {
    setIsOpen(false);
    navigate(path);
  }, [setIsOpen, navigate]);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Optimized backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fastTransition}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Optimized sidebar */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={fastTransition}
            className="fixed top-0 right-0 h-screen w-80 max-w-[90vw] sm:max-w-[85vw] z-50 overflow-y-auto overflow-x-hidden bg-slate-900/95 border-l border-slate-700"
            style={{
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
            }}
          >


            <div className="relative h-full flex flex-col">
              {/* Header Section */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <img
                    src={logo}
                    alt="GymTracker"
                    className="h-8 w-auto"
                    loading="eager"
                    decoding="async"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-white font-heading">GRIND-X</h2>
                    <div className="flex items-center space-x-2">
                      {connectionStatus.fullyOnline ? (
                        <Wifi size={12} className="text-green-400" />
                      ) : (
                        <WifiOff size={12} className="text-red-400" />
                      )}
                      <span className={`text-xs ${connectionStatus.fullyOnline ? 'text-green-400' : 'text-red-400'}`}>
                        {connectionStatus.mode.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors duration-150"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto py-4 px-3">
                {/* Navigation Menu */}
                <div className="space-y-2 mb-6">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.to);
                    
                    return (
                      <button
                        key={item.to}
                        onClick={() => handleMenuItemClick(item.to)}
                        className={`w-full flex items-center space-x-4 px-4 py-3 sm:py-4 rounded-xl transition-all duration-150 min-h-[52px] ${
                          isActive 
                            ? 'bg-blue-500/20 text-white border border-blue-500/30' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
                        }`}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0" style={{ color: isActive ? item.color : '#94a3b8' }}>
                          <Icon size={20} />
                        </div>

                        {/* Label */}
                        <span className="font-medium font-body text-sm sm:text-base">
                          {item.label}
                        </span>

                        {/* Active indicator */}
                        {isActive && (
                          <div
                            className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Profile Section - Inside scrollable area */}
                {isAuthenticated() && user ? (
                  <div className="border-t border-slate-700/50 pt-4 mt-4">
                    <div className="bg-slate-800/30 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                        <div>
                          {user?.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">
                          {user?.name || 'User'}
                        </h3>
                        <p className="text-slate-400 text-sm truncate">
                          {user?.email || ''}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-xs text-green-400">Online</span>
                        </div>
                      </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleMenuItemClick('/profile')}
                          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-150 min-h-[44px]"
                        >
                          <UserCircle size={18} />
                          <span className="text-sm sm:text-base font-body">My Account</span>
                        </button>

                        <button
                          onClick={() => handleMenuItemClick('/settings')}
                          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-150 min-h-[44px]"
                        >
                          <Settings size={18} />
                          <span className="text-sm sm:text-base font-body">Settings</span>
                        </button>

                        {/* Logout Button - Highlighted */}
                        <div className="pt-2 border-t border-slate-600/30 mt-3">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-3 py-4 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors duration-150 min-h-[48px] border border-red-500/20"
                          >
                            <LogOut size={20} />
                            <span className="text-base font-body font-semibold">Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-700/50 pt-4 mt-4">
                    <div className="space-y-3">
                      <button
                        onClick={() => handleMenuItemClick('/login')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-150 min-h-[48px]"
                      >
                        <User size={18} />
                        <span className="font-medium font-body">Login</span>
                      </button>

                      <button
                        onClick={() => handleMenuItemClick('/register')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150 min-h-[48px]"
                      >
                        <Zap size={18} />
                        <span className="font-medium font-body">Sign Up</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom padding for scroll */}
                <div className="h-6"></div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}