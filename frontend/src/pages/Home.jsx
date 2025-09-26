// Simple Home page that works reliably
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/Hero';

export default function Home() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const isAuthenticated = () => {
    try {
      return auth?.isAuthenticated() || false;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section - Full Width at Top */}
      <Hero />
      
      <div className="container mx-auto px-4 py-8">

        {/* Features */}
        <div className="features grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-slate-800/50 rounded-lg card">
            <div className="text-4xl mb-4">🏋️</div>
            <h3 className="text-xl font-bold text-white mb-2 font-heading">Workout Tracking</h3>
            <p className="text-slate-400 font-body">Log your exercises, sets, and reps with ease</p>
          </div>
          <div className="text-center p-6 bg-slate-800/50 rounded-lg card">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2 font-heading">Progress Analytics</h3>
            <p className="text-slate-400 font-body">Visualize your fitness journey with detailed charts</p>
          </div>
          <div className="text-center p-6 bg-slate-800/50 rounded-lg card">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2 font-heading">Goal Setting</h3>
            <p className="text-slate-400 font-body">Set and achieve your fitness milestones</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2 font-heading">10K+</div>
            <div className="text-slate-400 font-body">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400 mb-2 font-heading">50K+</div>
            <div className="text-slate-400 font-body">Workouts Logged</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-2 font-heading">25K+</div>
            <div className="text-slate-400 font-body">Goals Achieved</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-400 mb-2 font-heading">4.9★</div>
            <div className="text-slate-400 font-body">App Rating</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4 font-heading">Ready to Start Your Fitness Journey?</h2>
          <button
            onClick={() => navigate(isAuthenticated() ? '/dashboard' : '/register')}
            className="btn-primary px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:shadow-lg transition-all font-body"
          >
            <span className="font-body">{isAuthenticated() ? 'Go to Dashboard' : 'Join Now - It\'s Free!'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}