// Simple Home page fallback
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function HomeSimple() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              GymTracker
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Track your workouts, monitor your progress, and achieve your fitness goals with our comprehensive fitness tracking platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              🚀 Get Started
            </button>
            <Link to="/login">
              <button className="px-8 py-4 border-2 border-slate-600 text-slate-300 font-bold rounded-lg hover:bg-slate-700 transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-slate-800/50 rounded-lg">
            <div className="text-4xl mb-4">🏋️</div>
            <h3 className="text-xl font-bold text-white mb-2">Workout Tracking</h3>
            <p className="text-slate-400">Log your exercises, sets, and reps with ease</p>
          </div>
          <div className="text-center p-6 bg-slate-800/50 rounded-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Progress Analytics</h3>
            <p className="text-slate-400">Visualize your fitness journey with detailed charts</p>
          </div>
          <div className="text-center p-6 bg-slate-800/50 rounded-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">Goal Setting</h3>
            <p className="text-slate-400">Set and achieve your fitness milestones</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Fitness Journey?</h2>
          <button
            onClick={() => navigate('/register')}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:shadow-lg transition-all"
          >
            Join Now - It's Free!
          </button>
        </div>
      </div>
    </div>
  );
}