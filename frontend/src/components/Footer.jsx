import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  const footerLinks = {
    account: [
      { name: 'Profile', path: '/profile', icon: '👤' },
      { name: 'Settings', path: '/settings', icon: '⚙️' }
    ],
    resources: [
      { name: 'Contact', path: '/contact', icon: '📞' },
      { name: 'Forum', path: '/forum', icon: '💬' },
      { name: 'Help Center', path: '#', icon: '❓' }
    ],
    legal: [
      { name: 'Privacy Policy', path: '#', icon: '🔒' },
      { name: 'Terms of Service', path: '#', icon: '📄' }
    ]
  };

  const handleLinkClick = (path) => {
    if (path !== '#') {
      navigate(path);
    }
  };

  return (
    <footer className="relative mt-12 sm:mt-16 bg-gradient-to-br from-black via-neutral-900 to-black border-t border-neutral-800/50">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-600/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-700/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-600/3 rounded-full blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative backdrop-blur-xl">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
            
            {/* Company Section */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="relative">
                  <img src={logo} alt="GymTracker" className="h-8 sm:h-12 md:h-14 w-auto object-contain drop-shadow-lg" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-600 via-red-800 to-pink-500 opacity-20 blur-md"></div>
                </div>
                <div className="ml-3 sm:ml-6">
                  <h3 className="text-sm sm:text-xl md:text-2xl font-heading text-white">GYMTRACKER</h3>
                  <p className="text-[10px] sm:text-sm text-neutral-400 font-body">Fitness Tracking App</p>
                </div>
              </div>
              
              <p className="text-neutral-300 mb-3 sm:mb-4 md:mb-6 font-body text-[10px] sm:text-sm leading-relaxed">
                Professional fitness tracking for elite athletes worldwide. Transform your fitness journey with real-time analytics.
              </p>

              {/* Newsletter */}
              <div>
                <h4 className="text-[10px] sm:text-sm font-heading text-white mb-2 sm:mb-3">STAY UPDATED</h4>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-2.5 py-2 sm:px-3 sm:py-2.5 bg-neutral-900/60 border border-neutral-700/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 font-body text-[10px] sm:text-sm transition-all duration-300"
                    required
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-700 to-red-700 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 font-body text-[10px] sm:text-sm shadow-lg hover:shadow-red-600/25"
                  >
                    {subscribed ? '✓ Subscribed' : 'Join GRIND-X'}
                  </motion.button>
                </form>
              </div>
            </div>

            {/* Quick Links */}
            <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Account */}
              <div>
                <h4 className="text-[10px] sm:text-sm font-heading text-white mb-2 sm:mb-3">ACCOUNT</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {footerLinks.account.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleLinkClick(link.path)}
                        className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-neutral-400 hover:text-red-500 transition-all duration-300 font-body group w-full text-left"
                      >
                        <span className="group-hover:scale-110 transition-transform text-[10px] sm:text-xs">{link.icon}</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300 truncate">{link.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-[10px] sm:text-sm font-heading text-white mb-2 sm:mb-3">RESOURCES</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {footerLinks.resources.map((link, index) => (
                    <li key={index}>
                      {link.path !== '#' ? (
                        <Link
                          to={link.path}
                          className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-neutral-400 hover:text-red-500 transition-all duration-300 font-body group"
                        >
                          <span className="group-hover:scale-110 transition-transform text-[10px] sm:text-xs">{link.icon}</span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300 truncate">{link.name}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-neutral-400 hover:text-red-500 transition-all duration-300 font-body group w-full text-left"
                        >
                          <span className="group-hover:scale-110 transition-transform text-[10px] sm:text-xs">{link.icon}</span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300 truncate">{link.name}</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-[10px] sm:text-sm font-heading text-white mb-2 sm:mb-3">LEGAL</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleLinkClick(link.path)}
                        className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-neutral-400 hover:text-red-500 transition-all duration-300 font-body group w-full text-left"
                      >
                        <span className="group-hover:scale-110 transition-transform text-[10px] sm:text-xs">{link.icon}</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300 truncate">{link.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer Bottom */}
        <div className="border-t border-neutral-800/50 bg-black/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2">
              <div className="text-center sm:text-left">
                <p className="text-[9px] sm:text-xs text-neutral-400 font-body">
                  © 2026 GRIND-X. 
                </p>
                <p className="text-[9px] sm:text-xs text-neutral-500 font-body mt-0.5 sm:mt-1">
                  Empowering fitness transformations globally
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[9px] sm:text-xs text-neutral-500 font-body">v2.1.0</span>
                  <div className="w-0.5 h-3 sm:w-1 sm:h-4 bg-neutral-700 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] sm:text-xs text-red-500 font-body font-medium">System Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}