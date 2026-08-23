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
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/library', label: 'Library', icon: BookOpen },
    { to: '/start-workout', label: 'Workout', icon: Play },
    { to: '/nutrition', label: 'Nutrition', icon: Utensils }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-[420px] bg-[#0c0c0e]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
    >
      <div className="flex items-center justify-around w-full">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className="relative flex-1 flex flex-col items-center justify-center h-[54px] py-1 px-1 group no-underline hover:no-underline focus:outline-none select-none"
              style={{ WebkitTapHighlightColor: 'transparent', textDecoration: 'none' }}
            >
              {/* Ultra-Clean Apple-Style Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-white/[0.12] rounded-2xl border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}

              {/* Subtle Hover Pill */}
              <div className="absolute inset-0 bg-white/[0.05] rounded-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none" />

              {/* Icon & Label */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                <Icon className={`w-[20px] h-[20px] mb-1 transition-all duration-300 ${
                  isActive 
                    ? 'text-white stroke-[2.2] scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                    : 'text-neutral-400 stroke-[1.8] group-hover:text-neutral-200 group-hover:-translate-y-0.5'
                }`} />
                <span 
                  className={`text-[10px] tracking-tight transition-all duration-300 no-underline border-none leading-none ${
                    isActive 
                      ? 'text-white font-semibold drop-shadow-sm' 
                      : 'text-neutral-400 font-medium group-hover:text-neutral-200'
                  }`}
                  style={{ textDecoration: 'none' }}
                >
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
