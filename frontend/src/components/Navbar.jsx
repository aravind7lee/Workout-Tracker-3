// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Menu,
  X,
  Settings,
  LogOut,
  UserCircle,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react";
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
    { to: "/dashboard", label: "Dashboard" },
    { to: "/library", label: "Exercise Library" },
    { to: "/my-plans", label: "My Plans" },
    { to: "/plans", label: "Plan Builder" },
    { to: "/nutrition", label: "Nutrition" },
    { to: "/analytics", label: "Progress" },
    { to: "/legends", label: "Champs" },
    { to: "/profile", label: "Profile" },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-black/95 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl" 
          : "bg-gradient-to-r from-black/80 via-slate-900/80 to-black/80 backdrop-blur-lg border-b border-slate-800/30"
      }`}
    >
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-8xl mx-auto">
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
                style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))" }}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="relative group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                    isActiveRoute(link.to)
                      ? "text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25"
                      : "text-slate-200 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                  }`}
                >
                  <span className="relative z-10 font-body tracking-wide">{link.label}</span>
                  {!isActiveRoute(link.to) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </motion.div>

                {/* Active indicator */}
                {isActiveRoute(link.to) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-5">
            {/* Connection Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
              {connectionStatus.fullyOnline ? (
                <>
                  <Wifi size={16} className="text-green-400" />
                  <span className="text-xs font-semibold text-green-400 tracking-wide">ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff size={16} className="text-red-400" />
                  <span className="text-xs font-semibold text-red-400 tracking-wide">OFFLINE</span>
                </>
              )}
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
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#238636]/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#238636] flex items-center justify-center text-white font-bold text-sm">
                      {(user?.name && user.name.charAt(0)?.toUpperCase()) ||
                        "U"}
                    </div>
                  )}
                  <span className="hidden sm:block text-white font-medium font-body">
                    {user?.name || "User"}
                  </span>
                  <div className="hidden lg:flex items-center space-x-1 text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                    <Wifi size={12} />
                    <span className="font-semibold tracking-wide">LIVE</span>
                  </div>
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
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 lg:px-6 lg:py-3 text-sm font-semibold bg-slate-800/60 text-white rounded-lg hover:bg-slate-700/80 transition-all duration-300 flex items-center justify-center shadow-lg border border-slate-600/50 hover:border-slate-500/70 backdrop-blur-sm"
                >
                  <User size={16} className="mr-2" />
                  <span className="tracking-wide">LOGIN</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 lg:px-6 lg:py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Zap size={16} className="mr-2" />
                  <span className="tracking-wide">JOIN NOW</span>
                </Link>
              </div>
            )}

            {/* Ultra-Smooth Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-3 rounded-lg bg-slate-800/60 transition-all duration-300 ml-3 relative group border border-slate-600/50 hover:border-slate-500/70 backdrop-blur-sm"
            >
              <motion.div
                animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  duration: 0.3,
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
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Ultra-Smooth Mobile Sidebar */}
      <UltraSmoothSideMenu isOpen={isOpen} setIsOpen={setIsOpen} />
    </motion.nav>
  );
}
