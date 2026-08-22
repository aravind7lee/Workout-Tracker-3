import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Play, BookOpen, Utensils, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const location = useLocation();

  // Hide bottom nav during an active workout session to maximize gym screen space
  if (location.pathname === '/workout-session' || location.pathname === '/active-workout') {
    return null;
  }

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/library', label: 'Library', icon: BookOpen },
    { to: '/start-workout', label: 'Workout', icon: Play }, // Removed confusing 'highlight' block
    { to: '/nutrition', label: 'Nutrition', icon: Utensils },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-[380px] bg-[#121212]/95 backdrop-blur-2xl border border-white/[0.08] rounded-[36px] p-1.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-center justify-between px-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className="relative flex flex-col items-center justify-center w-[64px] h-[58px]"
            >
              {/* Premium Framer Motion Sliding Indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute top-1.5 w-[50px] h-[32px] bg-gradient-to-br from-orange-500 to-orange-600 rounded-[14px] shadow-[0_4px_12px_rgba(249,115,22,0.35)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              {/* Icon & Text Content */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pt-1.5">
                <Icon className={`w-5 h-5 mb-1 transition-all duration-300 ${isActive ? 'text-white stroke-[2.5]' : 'text-neutral-400 hover:text-neutral-300 stroke-[2]'}`} />
                <span className={`text-[10px] tracking-wide transition-all duration-300 ${
                  isActive ? 'text-white font-bold drop-shadow-md' : 'text-neutral-500 font-medium'
                }`}>
                  {link.label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
