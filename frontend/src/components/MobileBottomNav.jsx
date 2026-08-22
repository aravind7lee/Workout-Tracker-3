import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Play, History, Layers, TrendingUp, Utensils, BookOpen, User, Trophy, LayoutDashboard } from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();

  // Hide bottom nav during an active workout session to maximize gym screen space
  if (location.pathname === '/workout-session' || location.pathname === '/active-workout') {
    return null;
  }

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/start-workout', label: 'Workout', icon: Play, highlight: true },
    { to: '/library', label: 'Library', icon: BookOpen },
    { to: '/splits', label: 'Splits', icon: Layers },
    { to: '/analytics', label: 'Progress', icon: TrendingUp },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/nutrition', label: 'Nutrition', icon: Utensils }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t border-neutral-800 backdrop-blur-md px-2 py-1.5 shadow-2xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
                link.highlight && !isActive
                  ? 'text-orange-400 font-bold'
                  : isActive
                  ? 'text-orange-500 font-bold scale-105'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${
                link.highlight
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : isActive
                  ? 'bg-orange-500/10 text-orange-500'
                  : ''
              }`}>
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[9px] tracking-tight mt-0.5">{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
