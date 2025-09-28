import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
const logo = '/logo.png';

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
    <footer className="relative mt-12 sm:mt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/3 rounded-full blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative backdrop-blur-xl">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8">
            
            {/* Company Section */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="relative">
                  <img src={logo} alt="GymTracker" className="h-32 sm:h-36 w-auto object-contain drop-shadow-lg" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 opacity-20 blur-md"></div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl sm:text-2xl font-heading text-white">GYMTRACKER</h3>
                  <p className="text-sm text-slate-400 font-body">Fitness Tracking App</p>
                </div>
              </div>
              
              <p className="text-slate-300 mb-4 sm:mb-6 font-body text-sm leading-relaxed">
                Professional fitness tracking for elite athletes worldwide. Transform your fitness journey with real-time analytics.
              </p>

              {/* Newsletter */}
              <div>
                <h4 className="text-sm font-heading text-white mb-3">STAY UPDATED</h4>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2.5 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-body text-sm transition-all duration-300"
                    required
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 font-body text-sm shadow-lg hover:shadow-cyan-500/25"
                  >
                    {subscribed ? '✓ Subscribed' : 'Join Elite'}
                  </motion.button>
                </form>
              </div>
            </div>

            {/* Quick Links */}
            <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Account */}
              <div>
                <h4 className="text-sm font-heading text-white mb-3 sm:mb-4">ACCOUNT</h4>
                <ul className="space-y-2">
                  {footerLinks.account.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleLinkClick(link.path)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-all duration-300 font-body group w-full text-left"
                      >
                        <span className="group-hover:scale-110 transition-transform text-xs">{link.icon}</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-sm font-heading text-white mb-3 sm:mb-4">RESOURCES</h4>
                <ul className="space-y-2">
                  {footerLinks.resources.map((link, index) => (
                    <li key={index}>
                      {link.path !== '#' ? (
                        <Link
                          to={link.path}
                          className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-all duration-300 font-body group"
                        >
                          <span className="group-hover:scale-110 transition-transform text-xs">{link.icon}</span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-all duration-300 font-body group w-full text-left"
                        >
                          <span className="group-hover:scale-110 transition-transform text-xs">{link.icon}</span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-sm font-heading text-white mb-3 sm:mb-4">LEGAL</h4>
                <ul className="space-y-2">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleLinkClick(link.path)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-all duration-300 font-body group w-full text-left"
                      >
                        <span className="group-hover:scale-110 transition-transform text-xs">{link.icon}</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer Bottom */}
        <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
              <div className="text-center sm:text-left">
                <p className="text-xs text-slate-400 font-body">
                  © 2024 GymTracker. Built for Elite Athletes Worldwide.
                </p>
                <p className="text-xs text-slate-500 font-body mt-1">
                  Empowering fitness transformations globally
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-body">v2.1.0</span>
                  <div className="w-1 h-4 bg-slate-600 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-body font-medium">System Online</span>
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