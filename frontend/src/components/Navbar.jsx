// frontend/src/components/Navbar.jsx
import { User, Menu, X, Settings, LogOut, UserCircle, Zap, Wifi, WifiOff } from 'lucide-react';
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

import UltraSmoothSideMenu from "./UltraSmoothSideMenu";
import { useConnectionStatus } from "../services/connectionService";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const connectionStatus = useConnectionStatus();
  const profileRef = useRef(null);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/start-workout", label: "Start Workout" },
    { to: "/library", label: "Library" },
    { to: "/my-plans", label: "My Plans" },
    { to: "/plans", label: "Plans" },
    { to: "/splits", label: "Splits" },
    { to: "/nutrition", label: "Nutrition" },
    { to: "/analytics", label: "Analytics" },
    { to: "/legends", label: "Champs" },
    { to: "/profile", label: "Profile" },
  ];

  // Handle scroll effect and scroll direction for hiding navbar
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
    const previous = scrollY.getPrevious();

    // Hide navbar only when scrolling down and passed the top threshold
    // Show navbar when scrolling up or at the very top
    if (latest > previous && latest > 150) {
      setHidden(true);
      if (showProfileDropdown) setShowProfileDropdown(false);
    } else {
      setHidden(false);
    }
  });

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
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      initial="visible"
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? "bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/80 shadow-lg py-2"
          : "bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 py-3"
      }`}
    >
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between w-full h-12 sm:h-14">
          {/* Logo Section */}
          <Link to="/" className="group flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative z-10 transition-transform duration-300"
            >
              <img
                src={logo}
                alt="GymTracker Logo"
                className="h-8 sm:h-10 xl:h-11 w-auto object-contain"
                loading="eager"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-1 xl:gap-1.5 px-4 xl:px-8">
            {navLinks.map((link) => {
              const active = isActiveRoute(link.to);
              return (
                <Link key={link.to} to={link.to} className="relative group">
                  <div
                    className={`relative px-3.5 py-1.5 rounded-md text-[11px] xl:text-[12px] 2xl:text-[13px] font-bold tracking-wider uppercase transition-all duration-200 flex items-center whitespace-nowrap ${
                      active
                        ? "text-red-500 bg-red-950/30 border border-red-800/40"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                    }`}
                  >
                    <span className="relative z-10 whitespace-nowrap">{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className={`flex items-center gap-1.5 sm:gap-3 lg:gap-5 flex-shrink-0 transition-opacity duration-200 ${isOpen ? 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto' : 'opacity-100'}`}>
            {/* Connection Status */}
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-800 shadow-inner backdrop-blur-md">
              {connectionStatus.fullyOnline ? (
                <Wifi size={14} className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
              ) : (
                <WifiOff size={14} className="text-zinc-600" />
              )}
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:block">
              <SearchBar isMobile={false} />
            </div>

            {/* Mobile Search */}
            <div className="lg:hidden flex-shrink-0">
              <SearchBar isMobile={true} />
            </div>

            {/* Profile / Auth Dropdown */}
            {isAuthenticated() && user ? (
              <div ref={profileRef} className="relative z-[60] flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1a1a1a]/80 backdrop-blur-md border border-[#2a2a2a] hover:bg-[#252525] transition-all duration-300 shadow-lg relative flex-shrink-0 group"
                >
                  <div className="relative flex items-center justify-center w-[80%] h-[80%] rounded-full">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#cc1a1a] flex items-center justify-center text-white font-black text-[12px] sm:text-sm">
                        {(user?.name && user.name.charAt(0)?.toUpperCase()) || "U"}
                      </div>
                    )}
                    {connectionStatus.fullyOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#ff3b3b] rounded-full border-[2.5px] border-[#1a1a1a] shadow-[0_0_8px_rgba(255,59,59,0.8)] z-10" />
                    )}
                  </div>
                  {/* Keep text for desktop only but visually hidden on mobile */}
                  <span className="hidden xl:block text-[11px] lg:text-xs font-black text-white tracking-widest uppercase truncate max-w-[100px] ml-2">
                    {user?.name || "User"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-2 border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl z-[60] overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-zinc-800/50 mb-1 bg-gradient-to-b from-red-900/10 to-transparent">
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-0.5">Signed In As</p>
                        <p className="text-sm font-black text-white truncate">{user?.name || "Elite Athlete"}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-red-500/10 transition-colors group"
                      >
                        <UserCircle size={16} className="group-hover:text-red-500 transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-widest">My Profile</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-red-500/10 transition-colors group"
                      >
                        <Settings size={16} className="group-hover:text-red-500 transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
                      </Link>
                      
                      <div className="h-px bg-zinc-800/50 my-1 mx-4" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors w-full text-left group"
                      >
                        <LogOut size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
                <Link
                  to="/login"
                  className="px-1.5 py-1 sm:px-4 sm:py-2 text-[9px] sm:text-[11px] font-black text-zinc-400 hover:text-white uppercase tracking-widest transition-colors duration-300 flex items-center justify-center whitespace-nowrap"
                >
                  <User size={14} className="hidden sm:inline-block mr-1 opacity-50" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="relative group overflow-hidden px-2 py-1 sm:px-5 sm:py-2 text-[9px] sm:text-[11px] font-black text-white uppercase tracking-widest rounded-full bg-red-600 border border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:bg-red-500 transition-all duration-300 flex items-center justify-center whitespace-nowrap"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  <Zap size={14} className="hidden sm:inline-block mr-1" />
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile Sidebar Trigger (Ultra Smooth Component will handle the rest) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1a1a1a]/80 backdrop-blur-md border border-[#2a2a2a] text-zinc-300 hover:text-white hover:bg-[#252525] transition-all duration-300 shadow-lg relative z-[60] flex-shrink-0 ml-0.5 sm:ml-1"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X size={18} className="sm:w-5 sm:h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu size={18} className="sm:w-5 sm:h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Ultra-Smooth Mobile Sidebar */}
      <UltraSmoothSideMenu isOpen={isOpen} setIsOpen={setIsOpen} />
    </motion.nav>
  );
}
