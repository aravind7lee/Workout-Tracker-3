// Ultra-Optimized Side Menu for Mobile Performance
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  User, Menu, X, Settings, LogOut, UserCircle, Zap,
  Home, BarChart3, Dumbbell, Calendar, Apple, TrendingUp,
  Target, Award, Clock, Wifi, WifiOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useConnectionStatus } from "../services/connectionService";
import logo from "../assets/logo.png";

// Ultra-fast transitions for mobile performance
const mobileTransition = {
  duration: 0.15,
  ease: "ease-out"
};

const menuItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home, color: "#FF0000" },
  { to: "/library", label: "Library", icon: Dumbbell, color: "#8B0000" },
  { to: "/my-plans", label: "My Plans", icon: Calendar, color: "#00ff88" },
  { to: "/plans", label: "Plan Builder", icon: Target, color: "#ff6b6b" },
  { to: "/splits", label: "Splits", icon: BarChart3, color: "#ff9500" },
  { to: "/nutrition", label: "Nutrition", icon: Apple, color: "#ffa502" },
  { to: "/analytics", label: "Analytics", icon: TrendingUp, color: "#FF0000" },
  { to: "/legends", label: "Champs", icon: Award, color: "#ffd700" },
  { to: "/profile", label: "Profile", icon: UserCircle, color: "#8B0000" },
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
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
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
    <>
      {isOpen && (
        <>
          {/* Buttery smooth backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            style={{
              opacity: isOpen ? 1 : 0,
              transition: 'opacity 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'opacity',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
            }}
            onClick={() => setIsOpen(false)}
          />

          {/* Buttery smooth sidebar */}
          <div
            ref={sidebarRef}
            className="fixed top-0 right-0 h-screen w-80 max-w-[90vw] sm:max-w-[85vw] z-50 overflow-y-auto overflow-x-hidden bg-black/95 border-l border-neutral-800"
            style={{
              transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >


            <div className="relative h-full flex flex-col">
              {/* Header Section */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-800/50 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleMenuItemClick('/')}
                    className="hover:opacity-80 transition-opacity duration-200 active:scale-95 flex-shrink-0"
                    style={{
                      transition: 'all 0.06s ease-out',
                      willChange: 'opacity, transform',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <img
                      src={logo}
                      alt="GymTracker"
                      className="h-8 w-auto"
                      loading="eager"
                      decoding="async"
                    />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-white font-heading">GRIND-X</h2>
                    <div className="flex items-center space-x-2">
                      {connectionStatus.fullyOnline ? (
                        <Wifi size={12} className="text-red-500" />
                      ) : (
                        <WifiOff size={12} className="text-red-400" />
                      )}
                      <span className={`text-xs ${connectionStatus.fullyOnline ? 'text-red-500' : 'text-red-400'}`}>
                        {connectionStatus.mode.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-neutral-900/50 hover:bg-neutral-800/50"
                  style={{
                    transition: 'background-color 0.06s ease-out',
                    willChange: 'background-color',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <X size={20} className="text-neutral-400" />
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
                        className={`w-full flex items-center space-x-4 px-4 py-3 sm:py-4 rounded-xl min-h-[52px] ${
                          isActive 
                            ? 'bg-red-600/20 text-white border border-red-600/30' 
                            : 'text-neutral-300 hover:text-white hover:bg-neutral-800/30'
                        }`}
                        style={{
                          transition: 'all 0.06s ease-out',
                          willChange: 'background-color, color',
                          backfaceVisibility: 'hidden',
                          transform: 'translateZ(0)',
                        }}
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
                  <div className="border-t border-neutral-800/50 pt-4 mt-4">
                    <div className="bg-neutral-900/30 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                        <div>
                          {user?.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover border-2 border-red-600/30"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold">
                              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">
                          {user?.name || 'User'}
                        </h3>
                        <p className="text-neutral-400 text-sm truncate">
                          {user?.email || ''}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-xs text-red-500">Online</span>
                        </div>
                      </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleMenuItemClick('/profile')}
                          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 min-h-[44px]"
                          style={{
                            transition: 'all 0.06s ease-out',
                            willChange: 'background-color, color',
                            backfaceVisibility: 'hidden',
                          }}
                        >
                          <UserCircle size={18} />
                          <span className="text-sm sm:text-base font-body">My Account</span>
                        </button>

                        <button
                          onClick={() => handleMenuItemClick('/settings')}
                          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 min-h-[44px]"
                          style={{
                            transition: 'all 0.06s ease-out',
                            willChange: 'background-color, color',
                            backfaceVisibility: 'hidden',
                          }}
                        >
                          <Settings size={18} />
                          <span className="text-sm sm:text-base font-body">Settings</span>
                        </button>

                        {/* Logout Button - Highlighted */}
                        <div className="pt-2 border-t border-neutral-700/30 mt-3">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-3 py-4 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 min-h-[48px] border border-red-500/20"
                            style={{
                              transition: 'all 0.06s ease-out',
                              willChange: 'background-color, color',
                              backfaceVisibility: 'hidden',
                            }}
                          >
                            <LogOut size={20} />
                            <span className="text-base font-body font-semibold">Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-neutral-800/50 pt-4 mt-4">
                    <div className="space-y-3">
                      <button
                        onClick={() => handleMenuItemClick('/login')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 min-h-[48px]"
                        style={{
                          transition: 'background-color 0.06s ease-out',
                          willChange: 'background-color',
                          backfaceVisibility: 'hidden',
                        }}
                      >
                        <User size={18} />
                        <span className="font-medium font-body">Login</span>
                      </button>

                      <button
                        onClick={() => handleMenuItemClick('/register')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-700 text-white hover:bg-blue-700 min-h-[48px]"
                        style={{
                          transition: 'background-color 0.06s ease-out',
                          willChange: 'background-color',
                          backfaceVisibility: 'hidden',
                        }}
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
          </div>
        </>
      )}
    </>
  );
}