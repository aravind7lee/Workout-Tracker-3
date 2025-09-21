// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const auth = useAuth();
  const navigate = useNavigate();
  
  // Fallback for authentication check
  const isUserAuthenticated = () => {
    try {
      return auth?.isAuthenticated() || false;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });
  const statsControls = useAnimation();

  const features = [
    {
      icon: '🏋️',
      title: 'Quick-Add Workout',
      description: 'Log sets & reps instantly with smart exercise tracking',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      icon: '🍎',
      title: 'Smart Meal Planner',
      description: 'Real-time nutrition tracker with API-powered insights',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.2
    },
    {
      icon: '📊',
      title: 'Progress & Analytics',
      description: 'Charts, streaks, and growth tracking visualization',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.3
    },
    {
      icon: '🤝',
      title: 'Community Feed',
      description: 'Social updates and shared progress motivation',
      gradient: 'from-orange-500 to-red-500',
      delay: 0.4
    }
  ];

  const stats = [
    { number: 10000, label: 'Active Users', suffix: '+' },
    { number: 50000, label: 'Workouts Logged', suffix: '+' },
    { number: 25000, label: 'Goals Achieved', suffix: '+' },
    { number: 4.9, label: 'App Rating', suffix: '★' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Fitness Enthusiast',
      image: '👩‍💼',
      quote: 'GymTracker transformed my fitness journey. The streak system keeps me motivated every single day!',
      achievement: 'Lost 15kg in 6 months'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Personal Trainer',
      image: '👨‍🏫',
      quote: 'I recommend GymTracker to all my clients. The analytics help track real progress.',
      achievement: 'Trained 100+ clients'
    },
    {
      name: 'Emma Thompson',
      role: 'Marathon Runner',
      image: '🏃‍♀️',
      quote: 'The nutrition planner is incredible. It helped me optimize my performance completely.',
      achievement: '3 Marathon PRs'
    }
  ];

  useEffect(() => {
    if (isStatsInView) {
      statsControls.start('visible');
    }
  }, [isStatsInView, statsControls]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const AnimatedCounter = ({ end, duration = 2, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const isInView = useInView(countRef, { once: true });

    useEffect(() => {
      if (isInView) {
        let startTime;
        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
          setCount(Math.floor(progress * end));
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }
    }, [isInView, end, duration]);

    return (
      <span ref={countRef}>
        {count.toLocaleString()}{suffix}
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/30 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                delay: i * 0.5
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight"
              >
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                  Track.
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                  Improve.
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Conquer.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0"
              >
                Build Your Fitness Journey With Consistency.
                <br />
                <span className="text-blue-400 font-semibold">Professional. Gamified. Results-Driven.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.button
                  onClick={() => navigate(isUserAuthenticated() ? '/dashboard' : '/register')}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  🚀 {isUserAuthenticated() ? 'Go to Dashboard' : 'Start Tracking Now'}
                </motion.button>
                <Link to="/library">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-slate-600 text-slate-300 font-bold rounded-xl backdrop-blur-sm bg-slate-800/30 hover:bg-slate-700/50 transition-all duration-300"
                  >
                    🏋️ Explore Workouts
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Floating PR Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center"
            >
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative"
              >
                <div className="w-80 h-80 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 shadow-2xl p-8 flex flex-col justify-center items-center">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-sm text-slate-400 mb-2">Weekly PR</div>
                    <div className="text-4xl font-bold text-white mb-4">Bench +10kg</div>
                    <div className="text-lg text-slate-300 mb-6">Streak: 7 days 🔥</div>
                    <div className="flex justify-center space-x-2">
                      {[...Array(7)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-slate-400">Everything you need for your fitness journey</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="h-full p-8 rounded-2xl backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Join The Community
            </h2>
            <p className="text-xl text-slate-400">Thousands of fitness enthusiasts trust GymTracker</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <div className="text-slate-400 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-slate-400">Real transformations from real people</p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-8">
              <div className="text-6xl mb-4">{testimonials[currentTestimonial].image}</div>
              <h3 className="text-2xl font-bold text-white">{testimonials[currentTestimonial].name}</h3>
              <p className="text-blue-400">{testimonials[currentTestimonial].role}</p>
              <div className="inline-block px-4 py-2 mt-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full border border-green-500/30">
                <span className="text-green-400 font-semibold">{testimonials[currentTestimonial].achievement}</span>
              </div>
            </div>
            <blockquote className="text-xl text-slate-300 italic max-w-2xl mx-auto">
              "{testimonials[currentTestimonial].quote}"
            </blockquote>
          </motion.div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of fitness enthusiasts today.<br />
              Sign up now and start your streak.
            </p>
            <motion.button
              onClick={() => navigate(isUserAuthenticated() ? '/dashboard' : '/register')}
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              🚀 {isUserAuthenticated() ? 'Continue Your Journey' : 'Start Your Journey Now'}
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}