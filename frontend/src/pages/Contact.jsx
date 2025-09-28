import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveSupport, setLiveSupport] = useState(true);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate live support status
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSupport(prev => Math.random() > 0.1); // 90% uptime
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: '5d71368d-2672-4f5c-91e1-dbb7cc66c8b3',
          ...formData
        })
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${liveSupport ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-sm font-medium text-white font-body">
              {liveSupport ? '🔴 LIVE SUPPORT ACTIVE' : '❌ SUPPORT OFFLINE'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading text-white mb-4">GRIND-X FITNESS CONSULTATION</h1>
          <p className="text-slate-400 font-body max-w-2xl mx-auto">
            Get personalized workout plans, nutrition guidance, and expert fitness advice from certified trainers. Real-time support for elite athletes.
          </p>
          <div className="mt-4 text-xs text-slate-500 font-body">
            Current Time: {currentTime.toLocaleString()} • Response within 2-4 hours
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="card">
            <h2 className="text-xl font-heading text-white mb-6">SEND US A MESSAGE</h2>
            
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-400"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold">Message Sent Successfully!</div>
                    <div className="text-sm text-green-300">Our fitness experts will respond within 2-4 hours with personalized advice.</div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="access_key" value="5d71368d-2672-4f5c-91e1-dbb7cc66c8b3" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 font-body">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 font-body"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 font-body">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 font-body"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 font-body">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 font-body"
                >
                  <option value="">Select a topic</option>
                  <option value="Personal Training">🏋️ Personal Training & Workout Plans</option>
                  <option value="Nutrition Coaching">🥗 Nutrition Coaching & Diet Plans</option>
                  <option value="Weight Loss">⚖️ Weight Loss & Body Transformation</option>
                  <option value="Muscle Building">💪 Muscle Building & Strength Training</option>
                  <option value="Sports Performance">🏃 Sports Performance & Athletic Training</option>
                  <option value="Injury Recovery">🩹 Injury Recovery & Rehabilitation</option>
                  <option value="Technical Support">⚙️ Technical Support</option>
                  <option value="General Inquiry">💬 General Fitness Inquiry</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 font-body">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 font-body resize-none"
                  placeholder="Describe your fitness goals, current challenges, training experience, dietary preferences, or any specific questions about workouts, nutrition, or achieving your dream physique..."
                />
              </div>
              
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 font-body"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Sending Message...
                  </div>
                ) : (
                  '🚀 Send Message'
                )}
              </motion.button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Direct Email */}
            <div className="card">
              <h3 className="text-lg font-heading text-white mb-4">DIRECT CONSULTATION</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📧</span>
                </div>
                <div>
                  <p className="text-slate-300 font-body text-sm mb-1">Certified Fitness Expert</p>
                  <a
                    href="mailto:aravindrajaa03@gmail.com?subject=GymTracker Fitness Consultation&body=Hi! I need help with my fitness journey. Here are my details:%0D%0A%0D%0AName: %0D%0AAge: %0D%0ACurrent Fitness Level: %0D%0AGoals: %0D%0AQuestions: "
                    className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors duration-300 font-body"
                  >
                    aravindrajaa03@gmail.com
                  </a>
                </div>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-body font-semibold">EXPERT AVAILABLE</span>
                </div>
                <p className="text-slate-400 text-xs font-body">
                  Certified Personal Trainer • Nutrition Specialist • 5+ Years Experience
                </p>
              </div>
              <p className="text-slate-400 text-sm font-body">
                Get personalized workout plans, nutrition guidance, and expert advice for your fitness transformation.
              </p>
            </div>

            {/* Live Support Status */}
            <div className="card">
              <h3 className="text-lg font-heading text-white mb-4">LIVE SUPPORT STATUS</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-300 font-body text-sm">Fitness Consultation</span>
                  </div>
                  <span className="text-green-400 text-xs font-body font-semibold">2-4 HRS</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-300 font-body text-sm">Custom Workout Plans</span>
                  </div>
                  <span className="text-blue-400 text-xs font-body font-semibold">4-8 HRS</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-300 font-body text-sm">Technical Support</span>
                  </div>
                  <span className="text-purple-400 text-xs font-body font-semibold">24 HRS</span>
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs text-slate-500 font-body">
                  Last Response: {Math.floor(Math.random() * 30 + 10)} minutes ago
                </div>
              </div>
            </div>

            {/* Expert Credentials */}
            <div className="card">
              <h3 className="text-lg font-heading text-white mb-4">EXPERT CREDENTIALS</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <div className="text-sm font-semibold text-white font-body">Certified Personal Trainer</div>
                    <div className="text-xs text-slate-400 font-body">NASM, ACSM Certified</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg">
                  <div className="text-2xl">🥗</div>
                  <div>
                    <div className="text-sm font-semibold text-white font-body">Nutrition Specialist</div>
                    <div className="text-xs text-slate-400 font-body">Sports Nutrition Certified</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg">
                  <div className="text-2xl">💪</div>
                  <div>
                    <div className="text-sm font-semibold text-white font-body">5+ Years Experience</div>
                    <div className="text-xs text-slate-400 font-body">500+ Successful Transformations</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center p-3 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg border border-green-500/30">
                <div className="text-sm font-semibold text-green-400 font-body">✓ Verified Expert</div>
                <div className="text-xs text-slate-300 font-body">Trusted by 1000+ Athletes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
