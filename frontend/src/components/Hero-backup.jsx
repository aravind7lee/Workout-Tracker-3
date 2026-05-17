// frontend/src/components/Hero-backup.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSimple() {
  return (
    <section className="relative rounded-lg overflow-hidden bg-neutral-900/40 border border-neutral-800 p-8 mb-8">
      <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
            Track. Improve. Conquer.
          </h1>
          <p className="mt-4 text-neutral-300 max-w-xl">
            Build consistent habits, measure gains, and gamify your progress with streaks, badges, and jaw-dropping animations.
          </p>
          <div className="mt-6 flex gap-3">
            <Link 
              to="/dashboard" 
              className="px-6 py-3 rounded-md bg-gradient-to-r from-red-700 to-red-800 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Start Tracking Now
            </Link>
            <Link 
              to="/library" 
              className="px-6 py-3 rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-all"
            >
              Explore Library
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-64 h-64 bg-gradient-to-br from-neutral-900 to-black rounded-xl border border-neutral-700 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-neutral-400">Weekly PR</div>
              <div className="text-3xl mt-2 font-bold text-white">Bench +10kg</div>
              <div className="mt-2 text-neutral-300">Streak: 7 days 🔥</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}