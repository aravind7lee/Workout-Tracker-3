// Simple Hero Component - Fallback Version (No External Dependencies)
import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSimple() {
  return (
    <section className="relative rounded-2xl overflow-hidden mb-6 sm:mb-8 min-h-[500px] md:min-h-[600px]">
      {/* Simple Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight text-white">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    GymTracker
                  </span>
                  <br />
                  <span className="text-gray-100">Your Fitness Journey</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Transform your workouts with intelligent tracking, personalized plans, and real-time progress monitoring. 
                  <span className="text-blue-300 font-semibold"> Achieve your fitness goals faster than ever.</span>
                </p>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-4 py-2 border border-white border-opacity-20">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-200 text-sm font-medium">Smart Workout Plans</span>
                </div>
                <div className="flex items-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-4 py-2 border border-white border-opacity-20">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-200 text-sm font-medium">Progress Analytics</span>
                </div>
                <div className="flex items-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-4 py-2 border border-white border-opacity-20">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-200 text-sm font-medium">Nutrition Tracking</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/dashboard" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Start Your Journey</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link 
                  to="/library" 
                  className="px-8 py-4 bg-white bg-opacity-10 border-2 border-white border-opacity-30 text-gray-200 font-bold rounded-xl backdrop-blur-sm hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300"
                >
                  Explore Exercises
                </Link>
              </div>
            </div>

            {/* Simple Stats Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm w-full border border-white border-opacity-20">
                <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-gray-200 font-bold text-xl mb-4">Live Progress</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-400">0</div>
                      <div className="text-xs text-gray-300">Workouts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-green-400">0</div>
                      <div className="text-xs text-gray-300">Meals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-400">0</div>
                      <div className="text-xs text-gray-300">XP Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-400">0🔥</div>
                      <div className="text-xs text-gray-300">Streak</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white border-opacity-20">
                    <div className="text-sm text-gray-300">Weekly Goal</div>
                    <div className="mt-2 bg-gray-600 bg-opacity-50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-0 transition-all duration-500"></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">0 of 4 workouts completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}