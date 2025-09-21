// frontend/src/components/Hero.jsx
import React from 'react';
import ParticleBackground from './ParticleBackground';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative rounded-lg overflow-hidden card mb-6 sm:mb-8">
      <ParticleBackground />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        <div className="text-center lg:text-left">
          <h1 className="text-responsive-2xl font-extrabold leading-tight text-white animate-fade-in">
            Track. Improve. Conquer.
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 animate-fade-in-delay">
            Build consistent habits, measure gains, and gamify your progress with streaks, badges, and jaw-dropping animations.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center lg:items-start">
            <Link 
              to="/dashboard" 
              className="btn w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              Start Tracking Now
            </Link>
            <Link 
              to="/library" 
              className="btn w-full sm:w-auto border border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Explore Library
            </Link>
          </div>
        </div>
        <div className="flex justify-center mt-8 lg:mt-0">
          <div className="w-full max-w-xs sm:max-w-sm lg:w-64 lg:h-64 aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl card neon flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-xs sm:text-sm text-slate-400">Weekly PR</div>
              <div className="text-xl sm:text-2xl lg:text-3xl mt-2 font-bold text-white">Bench +10kg</div>
              <div className="mt-2 text-sm sm:text-base text-slate-300">Streak: 7 days 🔥</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
