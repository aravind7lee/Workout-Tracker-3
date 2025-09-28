import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function Footer() {
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

  return (
    <footer className="relative mt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative backdrop-blur-xl">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 lg:gap-8">
            
            {/* Company Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <div className="relative">
                  <img src={logo} alt="GymTracker" className="h-10 w-auto object-contain drop-shadow-lg" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 opacity-20 blur-md"></div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-heading text-white">GYMTRACKER</h3>
                  <p className="text-xs text-slate-400 font-body">Elite Fitness Tracking</p>
                </div>
              </div>
              
              <p className="text-slate-300 mb-6 font-body text-sm leading-relaxed">
                Professional fitness tracking for elite athletes worldwide.
              </p>

              {/* Newsletter */}
              <div>
                <h4 className="text-sm font-heading text-white mb-3">STAY UPDATED</h4>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 font-body text-sm"
                    required
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 font-body text-sm"
                  >
                    {subscribed ? '✓' : 'Join'}
                  </motion.button>
                </form>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Account */}
              <div>
                <h4 className="text-sm font-heading text-white mb-3">ACCOUNT</h4>
                <ul className="space-y-1.5">
                  {footerLinks.account.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.path}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors font-body group"
                      >
                        <span className="group-hover:scale-110 transition-transform text-xs">{link.icon}</span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-sm font-heading text-white mb-3">RESOURCES</h4>
                <ul className="space-y-1.5">
                  {footerLinks.resources.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.path}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors font-body group"
                      >
                        <span className="group-hover:scale-110 transition-transform text-xs">{link.icon}</span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-sm font-heading text-white mb-3">LEGAL</h4>
                <ul className="space-y-1.5">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.path}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors font-body group"
                      >
                        <span className="group-hover:scale-110 transition-transform text-xs">{link.icon}</span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-700/50 bg-slate-900/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs text-slate-400 font-body text-center sm:text-left">
                © 2024 GymTracker. Built for Elite Athletes Worldwide.
              </p>
              <div className="flex items-center justify-center sm:justify-end gap-3">
                <span className="text-xs text-slate-500 font-body">v2.1.0</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-body">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}