// frontend/src/components/Hero-backup.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSimple() {
  return (
    <section className="relative rounded-lg overflow-hidden bg-slate-800/40 border border-slate-700 p-8 mb-8">
      <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
            Track. Improve. Conquer.
          </h1>
          <p className="mt-4 text-slate-300 max-w-xl">
            Build consistent habits, measure gains, and gamify your progress with streaks, badges, and jaw-dropping animations.
          </p>
          <div className="mt-6 flex gap-3">
            <Link 
              to="/dashboard" 
              className="px-6 py-3 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Start Tracking Now
            </Link>
            <Link 
              to="/library" 
              className="px-6 py-3 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 transition-all"
            >
              Explore Library
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-64 h-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-600 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-slate-400">Weekly PR</div>
              <div className="text-3xl mt-2 font-bold text-white">Bench +10kg</div>
              <div className="mt-2 text-slate-300">Streak: 7 days 🔥</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}