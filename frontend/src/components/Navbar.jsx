// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X, Settings, LogOut, UserCircle, Zap, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";
import { demoService } from "../services/demoService";
import UltraSmoothSideMenu from "./UltraSmoothSideMenu";
import { useConnectionStatus } from "../services/connectionService";

const logo = "/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const connectionStatus = useConnectionStatus();
  const profileRef = useRef(null);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/library", label: "Library", icon: "📚" },
    { to: "/my-plans", label: "My Plans", icon: "📋" },
    { to: "/plans", label: "Plan Builder", icon: "🏗️" },
    { to: "/nutrition", label: "Nutrition", icon: "🍎" },
    { to: "/analytics", label: "Analytics", icon: "📈" },
    { to: "/profile", label: "Profile", icon: "👤" },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle body scroll lock when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("sidebar-open");
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.classList.remove("sidebar-open");
      document.body.style.top = "";
      if (scrollY) {
        const scrollPosition = Number(scrollY.replace("-", "")) || 0;
        window.scrollTo(0, scrollPosition);
      }
    }

    return () => {
      document.body.classList.remove("sidebar-open");
      document.body.style.top = "";
    };
  }, [isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (isOpen) {
          setIsOpen(false);
        } else if (showProfileDropdown) {
          setShowProfileDropdown(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showProfileDropdown]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowProfileDropdown(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`navbar-container fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "navbar-scrolled" : "navbar-default"
      }`}
    >
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-12 sm:h-14" : "h-14 sm:h-16"
          }`}
        >
          {/* Logo Section */}
          <Link to="/" className="group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10"
            >
              <img
                src={logo}
                alt="GymTracker Logo"
                className="h-32 w-auto object-contain transition-all duration-300 drop-shadow-lg"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="relative group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActiveRoute(link.to)
                      ? "text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/30"
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  <span className="font-body">{link.label}</span>
                </motion.div>

                {/* Active indicator */}
                {isActiveRoute(link.to) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Connection Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/50 backdrop-blur-sm">
              {connectionStatus.fullyOnline ? (
                <Wifi size={14} className="text-green-400" />
              ) : (
                <WifiOff size={14} className="text-red-400" />
              )}
              <span className={`text-xs font-medium ${
                connectionStatus.fullyOnline ? 'text-green-400' : 'text-red-400'
              }`}>
                {connectionStatus.fullyOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden lg:block">
              <SearchBar isMobile={false} />
            </div>

            {/* Mobile Search */}
            <div className="lg:hidden">
              <SearchBar isMobile={true} />
            </div>

            {/* Profile Dropdown */}
            {isAuthenticated() && user ? (
              <div ref={profileRef} className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {(user?.name && user.name.charAt(0)?.toUpperCase()) ||
                        "U"}
                    </div>
                  )}
                  <span className="hidden sm:block text-white font-medium font-body">
                    {user?.name || "User"}
                  </span>
                  <span className="hidden lg:block text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                    Online
                  </span>
                </motion.button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-2"
                      style={{
                        background: "var(--bg-soft)",
                        border: "1px solid var(--panel-border)",
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center space-x-3 px-4 py-2 transition-colors"
                        style={{
                          color: "var(--text)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = "var(--heading)";
                          e.target.style.background = "var(--bg-accent)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "var(--text)";
                          e.target.style.background = "transparent";
                        }}
                      >
                        <UserCircle size={16} />
                        <span className="font-body">My Account</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center space-x-3 px-4 py-2 transition-colors"
                        style={{
                          color: "var(--text)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = "var(--heading)";
                          e.target.style.background = "var(--bg-accent)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "var(--text)";
                          e.target.style.background = "transparent";
                        }}
                      >
                        <Settings size={16} />
                        <span className="font-body">Settings</span>
                      </Link>
                      <hr
                        style={{
                          margin: "8px 0",
                          border: "none",
                          borderTop: "1px solid var(--panel-border)",
                        }}
                      />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 transition-colors w-full text-left"
                        style={{
                          color: "var(--danger)",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "rgba(255, 71, 87, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                        }}
                      >
                        <LogOut size={16} />
                        <span className="font-body">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                <Link
                  to="/login"
                  className="px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  <User size={16} className="mr-1" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  <Zap size={16} className="mr-1" />
                  Sign Up
                </Link>
              </div>
            )}

            {/* Ultra-Smooth Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-3 rounded-full bg-slate-800/50 backdrop-blur-sm transition-all duration-300 ml-2 relative group"
            >
              <motion.div
                animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30,
                  duration: 0.3 
                }}
              >
                {isOpen ? (
                  <X
                    size={22}
                    className="text-slate-400 group-hover:text-white transition-colors duration-200"
                  />
                ) : (
                  <Menu
                    size={22}
                    className="text-slate-400 group-hover:text-white transition-colors duration-200"
                  />
                )}
              </motion.div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Ultra-Smooth Mobile Sidebar */}
      <UltraSmoothSideMenu isOpen={isOpen} setIsOpen={setIsOpen} />
    </motion.nav>
  );
}
