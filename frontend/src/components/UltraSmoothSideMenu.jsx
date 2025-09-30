// Ultra-Smooth Premium Side Menu for GymTracker
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { 
  User, Menu, X, Settings, LogOut, UserCircle, Zap,
  Home, BarChart3, Dumbbell, Calendar, Apple, TrendingUp,
  Target, Award, Clock, Wifi, WifiOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useConnectionStatus } from "../services/connectionService";

const logo = "/logo.png";

// Ultra-smooth spring configurations
const springConfig = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8
};

const ultraSmoothSpring = {
  type: "spring",
  stiffness: 600,
  damping: 35,
  mass: 0.6
};

const menuItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home, color: "#00d4ff" },
  { to: "/library", label: "Library", icon: Dumbbell, color: "#8b5cf6" },
  { to: "/my-plans", label: "My Plans", icon: Calendar, color: "#00ff88" },
  { to: "/plans", label: "Plan Builder", icon: Target, color: "#ff6b6b" },
  { to: "/nutrition", label: "Nutrition", icon: Apple, color: "#ffa502" },
  { to: "/analytics", label: "Analytics", icon: TrendingUp, color: "#00d4ff" },
  { to: "/profile", label: "Profile", icon: UserCircle, color: "#8b5cf6" },
];

export default function UltraSmoothSideMenu({ isOpen, setIsOpen }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const connectionStatus = useConnectionStatus();
  
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);

  // Ultra-smooth spring animations
  const sidebarX = useSpring(isOpen ? 0 : 100, ultraSmoothSpring);
  const backdropOpacity = useSpring(isOpen ? 1 : 0, springConfig);
  const sidebarOpacity = useSpring(isOpen ? 1 : 0, springConfig);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced body scroll lock with smooth transitions
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      if (scrollY) {
        const scrollPosition = parseInt(scrollY || '0') * -1;
        window.scrollTo(0, scrollPosition);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showProfileDropdown) {
          setShowProfileDropdown(false);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showProfileDropdown, setIsOpen]);

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
          {/* Ultra-smooth backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springConfig}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            style={{
              backdropFilter: 'blur(8px) saturate(150%)',
              WebkitBackdropFilter: 'blur(8px) saturate(150%)',
            }}
            onClick={() => setIsOpen(false)}
          />

          {/* Ultra-smooth sidebar */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={ultraSmoothSpring}
            className="fixed top-0 right-0 h-screen w-80 max-w-[90vw] sm:max-w-[85vw] z-50 overflow-y-auto overflow-x-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%)',
              backdropFilter: 'blur(25px) saturate(180%)',
              WebkitBackdropFilter: 'blur(25px) saturate(180%)',
              boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.8), inset 1px 0 0 rgba(0, 212, 255, 0.2)',
              borderLeft: '2px solid rgba(0, 212, 255, 0.3)',
            }}
          >
            {/* Animated gradient overlay */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
              }}
            />

            <div className="relative h-full flex flex-col">
              {/* Header Section */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...springConfig, delay: 0.1 }}
                className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50 flex-shrink-0"
              >
                <div className="flex items-center space-x-3">
                  <motion.img
                    src={logo}
                    alt="GymTracker"
                    className="h-12 w-auto"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={ultraSmoothSpring}
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

                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={ultraSmoothSpring}
                >
                  <X size={20} className="text-slate-400" />
                </motion.button>
              </motion.div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto py-4 px-3">
                {/* Navigation Menu */}
                <div className="space-y-2 mb-6">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.to);
                    
                    return (
                      <motion.div
                        key={item.to}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ ...springConfig, delay: 0.1 + index * 0.05 }}
                      >
                        <motion.button
                          onClick={() => handleMenuItemClick(item.to)}
                          className={`w-full flex items-center space-x-4 px-4 py-3 sm:py-4 rounded-xl transition-all duration-300 group relative overflow-hidden min-h-[52px] ${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30' 
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
                          }`}
                          onMouseEnter={() => setHoveredItem(item.to)}
                          onMouseLeave={() => setHoveredItem(null)}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          transition={ultraSmoothSpring}
                        >
                          {/* Animated background */}
                          <motion.div
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                            style={{
                              background: `linear-gradient(135deg, ${item.color}15, ${item.color}05)`,
                            }}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: hoveredItem === item.to ? 1 : 0.8 }}
                            transition={ultraSmoothSpring}
                          />

                          {/* Icon with color animation */}
                          <motion.div
                            className="relative z-10"
                            animate={{
                              color: isActive || hoveredItem === item.to ? item.color : '#94a3b8',
                              scale: isActive || hoveredItem === item.to ? 1.1 : 1,
                            }}
                            transition={ultraSmoothSpring}
                          >
                            <Icon size={20} />
                          </motion.div>

                          {/* Label */}
                          <span className="relative z-10 font-medium font-body text-sm sm:text-base">
                            {item.label}
                          </span>

                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              className="absolute right-2 w-2 h-2 rounded-full"
                              style={{ backgroundColor: item.color }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={ultraSmoothSpring}
                            />
                          )}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Profile Section - Inside scrollable area */}
                {isAuthenticated() && user ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ ...springConfig, delay: 0.3 }}
                    className="border-t border-slate-700/50 pt-4 mt-4"
                  >
                    <div className="bg-slate-800/30 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={ultraSmoothSpring}
                      >
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
                      </motion.div>
                      
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
                        <motion.button
                          onClick={() => handleMenuItemClick('/profile')}
                          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 min-h-[44px]"
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          transition={ultraSmoothSpring}
                        >
                          <UserCircle size={18} />
                          <span className="text-sm sm:text-base font-body">My Account</span>
                        </motion.button>

                        <motion.button
                          onClick={() => handleMenuItemClick('/settings')}
                          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 min-h-[44px]"
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          transition={ultraSmoothSpring}
                        >
                          <Settings size={18} />
                          <span className="text-sm sm:text-base font-body">Settings</span>
                        </motion.button>

                        {/* Logout Button - Highlighted */}
                        <div className="pt-2 border-t border-slate-600/30 mt-3">
                          <motion.button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-3 py-4 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-200 min-h-[48px] border border-red-500/20"
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            transition={ultraSmoothSpring}
                          >
                            <LogOut size={20} />
                            <span className="text-base font-body font-semibold">Logout</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ ...springConfig, delay: 0.3 }}
                    className="border-t border-slate-700/50 pt-4 mt-4"
                  >
                    <div className="space-y-3">
                      <motion.button
                        onClick={() => handleMenuItemClick('/login')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-200 min-h-[48px]"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={ultraSmoothSpring}
                      >
                        <User size={18} />
                        <span className="font-medium font-body">Login</span>
                      </motion.button>

                      <motion.button
                        onClick={() => handleMenuItemClick('/register')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 min-h-[48px]"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={ultraSmoothSpring}
                      >
                        <Zap size={18} />
                        <span className="font-medium font-body">Sign Up</span>
                      </motion.button>
                    </div>
                  </motion.div>
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