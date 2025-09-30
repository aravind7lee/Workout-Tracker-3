// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, X, Settings, LogOut, UserCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import { demoService } from '../services/demoService';

const logo = '/logo.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const profileRef = useRef(null);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/library', label: 'Library', icon: '📚' },
    { to: '/my-plans', label: 'My Plans', icon: '📋' },
    { to: '/plans', label: 'Plan Builder', icon: '🏗️' },
    { to: '/nutrition', label: 'Nutrition', icon: '🍎' },
    { to: '/analytics', label: 'Analytics', icon: '📈' },
    { to: '/profile', label: 'Profile', icon: '👤' }
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle body scroll lock when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.classList.remove('sidebar-open');
      document.body.style.top = '';
      if (scrollY) {
        const scrollPosition = Number(scrollY.replace('-', '')) || 0;
        window.scrollTo(0, scrollPosition);
      }
    }
    
    return () => {
      document.body.classList.remove('sidebar-open');
      document.body.style.top = '';
    };
  }, [isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isOpen) {
          setIsOpen(false);
        } else if (showProfileDropdown) {
          setShowProfileDropdown(false);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showProfileDropdown]);

  const handleLogout = () => {
    logout();
    navigate('/');
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
        isScrolled ? 'navbar-scrolled' : 'navbar-default'
      }`}
    >
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-12 sm:h-14' : 'h-14 sm:h-16'
        }`}>
          
          {/* Logo Section */}
          <Link to="/" className="group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <img 
                src={logo} 
                alt="GymTracker Logo" 
                className="h-32 w-auto object-contain transition-all duration-300 drop-shadow-lg"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-300"></div>
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
                      ? 'text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
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
                      {(user?.name && user.name.charAt(0)?.toUpperCase()) || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:block text-white font-medium font-body">{user?.name || 'User'}</span>
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
                        background: 'var(--bg-soft)',
                        border: '1px solid var(--panel-border)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center space-x-3 px-4 py-2 transition-colors"
                        style={{
                          color: 'var(--text)',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--heading)';
                          e.target.style.background = 'var(--bg-accent)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text)';
                          e.target.style.background = 'transparent';
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
                          color: 'var(--text)',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--heading)';
                          e.target.style.background = 'var(--bg-accent)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text)';
                          e.target.style.background = 'transparent';
                        }}
                      >
                        <Settings size={16} />
                        <span className="font-body">Settings</span>
                      </Link>
                      <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--panel-border)' }} />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 transition-colors w-full text-left"
                        style={{
                          color: 'var(--danger)',
                          background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255, 71, 87, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
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

            {/* Enhanced Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-2 rounded-full bg-slate-800/50 backdrop-blur-sm transition-all duration-300 ml-2 relative group"
            >
              <motion.div
                animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {isOpen ? <X size={24} className="text-slate-400 group-hover:text-white transition-colors duration-200" /> : 
                         <Menu size={24} className="text-slate-400 group-hover:text-white transition-colors duration-200" />}
              </motion.div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Enhanced Backdrop with Morphing Animation */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setIsOpen(false)}
              className="xl:hidden fixed inset-0 bg-black/50 z-40"
              style={{ touchAction: 'none' }}
            />
            
            {/* Enhanced Sidebar with Solid Background */}
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 35,
                mass: 0.8,
              }}
              className="mobile-sidebar xl:hidden fixed top-0 right-0 h-[100dvh] w-72 max-w-[85vw] z-50 overflow-y-auto overscroll-behavior-contain"
              style={{
                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.8), inset 1px 0 0 rgba(71, 85, 105, 0.3)',
                borderLeft: '2px solid rgba(0, 212, 255, 0.3)'
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="p-4 sm:p-6 pb-safe">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={logo} 
                        alt="GymTracker Logo" 
                        className="h-32 sm:h-36 w-auto object-contain drop-shadow-lg"
                      />
                      {demoService.isDemoMode() && (
                        <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full animate-pulse font-bold">
                          DEMO
                        </span>
                      )}
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="relative p-2 rounded-full bg-slate-800/50 backdrop-blur-sm min-w-[44px] min-h-[44px] flex items-center justify-center group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close menu"
                  >
                    <motion.div
                      initial={{ scale: 0.8, rotate: 0 }}
                      animate={{ scale: 1, rotate: 180 }}
                      exit={{ scale: 0.8, rotate: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <X 
                        size={20}
                        className="text-slate-400 group-hover:text-white transition-colors duration-200"
                      />
                    </motion.div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </motion.button>
                </div>

                {/* Enhanced Mobile Navigation Links */}
                <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                  {navLinks.map((link) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        to={link.to}
                        onClick={() => setIsOpen(false)}
                        className={`nav-link group flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-300 min-h-[48px] relative overflow-hidden ${
                          isActiveRoute(link.to) ? 'active' : ''
                        }`}
                        style={{
                          background: isActiveRoute(link.to) 
                            ? 'linear-gradient(145deg, var(--bg-accent), rgba(var(--accent-rgb), 0.15))' 
                            : 'transparent',
                          color: isActiveRoute(link.to) ? 'var(--accent)' : 'var(--text)'
                        }}
                      onMouseEnter={(e) => {
                        if (!isActiveRoute(link.to)) {
                          e.target.style.background = 'var(--bg-accent)';
                          e.target.style.color = 'var(--heading)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActiveRoute(link.to)) {
                          e.target.style.background = 'transparent';
                          e.target.style.color = 'var(--text)';
                        }
                      }}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span className="font-medium text-base font-body">{link.label}</span>
                    </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Enhanced Mobile Profile Section */}
                {isAuthenticated() && user ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="border-t pt-4 sm:pt-6" 
                    style={{ 
                      borderColor: 'rgba(0, 212, 255, 0.2)',
                      background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.3), rgba(15, 23, 42, 0.8))'
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-3 sm:mb-4 p-3 rounded-xl" style={{ background: 'rgba(71, 85, 105, 0.2)' }}>
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {user?.profileImage ? (
                          <div className="relative group">
                            <img 
                              src={user.profileImage} 
                              alt="Profile" 
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-blue-500/30 group-hover:border-blue-500/50 transition-colors duration-200"
                            />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            <span className="relative z-10">{(user?.name && user.name.charAt(0)?.toUpperCase()) || 'U'}</span>
                          </div>
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm sm:text-base" style={{ color: 'var(--heading)' }}>{user?.name || 'User'}</div>
                        <div className="text-xs sm:text-sm truncate" style={{ color: 'var(--muted)' }}>{user?.email || ''}</div>
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                          className="text-xs inline-flex items-center space-x-1 bg-green-900/30 px-2 py-1 rounded-full mt-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-green-400">Online</span>
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors min-h-[44px]"
                        style={{ color: 'var(--text)' }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--heading)';
                          e.target.style.background = 'var(--bg-accent)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text)';
                          e.target.style.background = 'transparent';
                        }}
                      >
                        <UserCircle size={18} />
                        <span className="text-sm sm:text-base font-body">My Account</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors min-h-[44px]"
                        style={{ color: 'var(--text)' }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--heading)';
                          e.target.style.background = 'var(--bg-accent)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text)';
                          e.target.style.background = 'transparent';
                        }}
                      >
                        <Settings size={18} />
                        <span className="text-sm sm:text-base font-body">Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors w-full text-left min-h-[44px]"
                        style={{ color: 'var(--danger)', background: 'transparent' }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255, 71, 87, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                      >
                        <LogOut size={18} />
                        <span className="text-sm sm:text-base font-body">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="border-t pt-4 sm:pt-6" style={{ borderColor: 'var(--panel-border)' }}>
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 shadow-lg"
                      >
                        <User size={18} />
                        <span className="font-medium font-body">Login</span>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg"
                      >
                        <Zap size={18} />
                        <span className="font-medium font-body">Sign Up</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}