// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, Menu, X, Settings, LogOut, UserCircle, Clock, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealTimeSearch } from '../hooks/useRealTimeSearch';
import ThemeToggle from './ThemeToggle';


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  
  const { searchQuery, setSearchQuery, searchResults, isSearching, clearSearch } = useRealTimeSearch();
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const searchRef = useRef(null);
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchExpanded(false);
        setShowSearchResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show search results when there's a query
  useEffect(() => {
    setShowSearchResults(searchQuery.length > 0 && searchExpanded);
  }, [searchQuery, searchExpanded]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      clearSearch();
      setSearchExpanded(false);
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (result) => {
    // Navigate to existing pages with search parameters
    switch (result.type) {
      case 'exercise':
        navigate(`/library?search=${encodeURIComponent(result.title)}`);
        break;
      case 'meal':
        navigate(`/nutrition?search=${encodeURIComponent(result.title)}`);
        break;
      case 'plan':
        if (result.id) {
          navigate(`/my-plans?highlight=${result.id}`);
        } else {
          navigate(`/my-plans?search=${encodeURIComponent(result.title)}`);
        }
        break;
      default:
        navigate(`/library?search=${encodeURIComponent(result.title)}`);
    }
    clearSearch();
    setSearchExpanded(false);
    setShowSearchResults(false);
  };

  const getResultTypeColor = (type) => {
    switch (type) {
      case 'workout': return 'text-blue-400';
      case 'meal': return 'text-green-400';
      case 'plan': return 'text-purple-400';
      case 'exercise': return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

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
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                GX
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 opacity-30 blur-md group-hover:opacity-60 transition-opacity duration-300"></div>
            </motion.div>
            <motion.div
              className="text-lg sm:text-xl font-bold brand-text transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <span className="hidden xs:inline">GymTracker</span>
              <span className="xs:hidden">GrindX</span>
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
                  {link.label}
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
            
            {/* Search Bar */}
            <div ref={searchRef} className="relative hidden lg:block">
              <AnimatePresence>
                {searchExpanded ? (
                  <motion.div
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <form onSubmit={handleSearch} className="flex items-center">
                      <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search workouts, meals, plans..."
                          className="w-full pl-10 pr-10 py-2 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                          autoFocus
                        />
                        {isSearching && (
                          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSearchExpanded(false);
                            setShowSearchResults(false);
                            clearSearch();
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </form>
                    
                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {showSearchResults && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl py-2 max-h-80 overflow-y-auto z-50"
                          style={{
                            background: 'var(--bg-soft)',
                            border: '1px solid var(--panel-border)',
                            backdropFilter: 'blur(20px)'
                          }}
                        >
                          {searchResults.length > 0 ? (
                            <>
                              <div className="px-4 py-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--panel-border)' }}>
                                Search Results ({searchResults.length})
                              </div>
                              {searchResults.map((result) => (
                                <motion.button
                                  key={result.id}
                                  onClick={() => handleSearchResultClick(result)}
                                  whileHover={{ backgroundColor: 'rgba(71, 85, 105, 0.3)' }}
                                  className="w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors"
                                  style={{ background: 'transparent' }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = 'var(--bg-accent)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                  }}
                                >
                                  <div className="text-2xl">{result.icon}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate" style={{ color: 'var(--heading)' }}>{result.title}</div>
                                    <div className="text-sm truncate" style={{ color: 'var(--muted)' }}>{result.description}</div>
                                  </div>
                                  <div className={`text-xs px-2 py-1 rounded-full capitalize ${getResultTypeColor(result.type)}`} style={{ background: 'var(--bg-accent)' }}>
                                    {result.type}
                                  </div>
                                </motion.button>
                              ))}
                              {searchQuery && (
                                <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--panel-border)' }}>
                                  <button
                                    onClick={handleSearch}
                                    className="w-full flex items-center space-x-3 px-4 py-2 transition-colors"
                                    style={{ color: 'var(--accent)', background: 'transparent' }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = 'var(--bg-accent)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = 'transparent';
                                    }}
                                  >
                                    <Search size={16} />
                                    <span>Search for "{searchQuery}"</span>
                                  </button>
                                </div>
                              )}
                            </>
                          ) : searchQuery && !isSearching ? (
                            <div className="px-4 py-8 text-center">
                              <div className="mb-2" style={{ color: 'var(--muted)' }}>No results found</div>
                              <div className="text-sm" style={{ color: 'var(--muted)' }}>Try searching for workouts, meals, or plans</div>
                            </div>
                          ) : null}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchExpanded(true)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                  >
                    <Search size={20} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            {isAuthenticated() && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
              >
                <Bell size={20} />
                {notifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.button>
            )}

            {/* Profile Dropdown */}
            {isAuthenticated() ? (
              <div ref={profileRef} className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-white font-medium">{user?.name || 'User'}</span>
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
                        <span>My Account</span>
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
                        <span>Settings</span>
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
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                <Link
                  to="/login"
                  className="px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center justify-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Theme Toggle - Always visible on all screens */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-2 rounded-xl transition-all duration-300 ml-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="xl:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="xl:hidden fixed top-0 right-0 h-full w-80 sm:w-96 backdrop-blur-xl shadow-2xl z-50"
              style={{
                background: 'var(--bg-soft)',
                border: '1px solid var(--panel-border)'
              }}
            >
              <div className="p-6">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      GT
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--heading)' }}>GymTracker</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl transition-colors duration-300"
                    style={{ color: 'var(--text)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text)'}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Mobile Search */}
                <div className="mb-6">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300" size={20} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search workouts, meals, plans..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-all duration-300"
                        style={{
                          background: 'var(--bg-soft)',
                          border: '2px solid var(--panel-border)',
                          color: 'var(--text)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--panel-border)'}
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </form>
                  
                  {/* Mobile Search Results */}
                  {searchQuery && (
                    <div className="mt-4 rounded-xl p-2 max-h-60 overflow-y-auto" style={{ background: 'var(--bg-soft)', border: '1px solid var(--panel-border)' }}>
                      {searchResults.length > 0 ? (
                        <>
                          <div className="text-xs font-medium uppercase tracking-wide px-2 py-1 mb-2" style={{ color: 'var(--muted)' }}>
                            Results ({searchResults.length})
                          </div>
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => {
                                handleSearchResultClick(result);
                                setIsOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 px-2 py-2 text-left rounded-lg transition-colors"
                              style={{ background: 'transparent' }}
                              onMouseEnter={(e) => e.target.style.background = 'var(--bg-accent)'}
                              onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                              <div className="text-lg">{result.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate" style={{ color: 'var(--heading)' }}>{result.title}</div>
                                <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>{result.description}</div>
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full bg-slate-700/50 ${getResultTypeColor(result.type)} capitalize`}>
                                {result.type}
                              </div>
                            </button>
                          ))}
                          <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--panel-border)' }}>
                            <button
                              onClick={() => {
                                handleSearch({ preventDefault: () => {} });
                                setIsOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 px-2 py-2 transition-colors rounded-lg"
                              style={{ color: 'var(--accent)', background: 'transparent' }}
                              onMouseEnter={(e) => e.target.style.background = 'var(--bg-accent)'}
                              onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                              <Search size={16} />
                              <span>View all results for "{searchQuery}"</span>
                            </button>
                          </div>
                        </>
                      ) : !isSearching ? (
                        <div className="px-2 py-4 text-center">
                          <div className="text-sm" style={{ color: 'var(--muted)' }}>No results found</div>
                          <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Try different keywords</div>
                        </div>
                      ) : (
                        <div className="px-2 py-4 text-center">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                          <div className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Searching...</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile Theme Toggle - Always show in sidebar */}
                <div className="mb-6 flex justify-center">
                  <ThemeToggle />
                </div>

                {/* Mobile Navigation Links */}
                <div className="space-y-2 mb-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className={`nav-link flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActiveRoute(link.to) ? 'active' : ''
                      }`}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Mobile Profile Section */}
                {isAuthenticated() && (
                  <div className="border-t pt-6" style={{ borderColor: 'var(--panel-border)' }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: 'var(--heading)' }}>{user?.name || 'User'}</div>
                        <div className="text-sm" style={{ color: 'var(--muted)' }}>{user?.email}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 rounded-xl transition-colors"
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
                        <UserCircle size={16} />
                        <span>My Account</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 rounded-xl transition-colors"
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
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 rounded-xl transition-colors w-full text-left"
                        style={{ color: 'var(--danger)', background: 'transparent' }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255, 71, 87, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
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