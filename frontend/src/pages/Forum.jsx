import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Forum() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [activeFilter, setActiveFilter] = useState('recent');
  const [liveUsers, setLiveUsers] = useState(1247);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [postSuccess, setPostSuccess] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  // Load posts from localStorage on component mount
  useEffect(() => {
    const loadPosts = () => {
      try {
        // Load user posts from localStorage
        const savedPosts = JSON.parse(localStorage.getItem('gymtracker_forum_posts') || '[]');
        
        // Default expert posts for demonstration
        const expertPosts = [
          { 
            _id: 'expert_1', 
            user: { name: 'Alex "Beast" Johnson', level: 'Elite Athlete', avatar: '🏆', verified: true }, 
            content: 'Just smashed my 5K PR - 18:45! 🔥 The key was consistent interval training and proper nutrition. Who else is working on their cardio game?', 
            likes: 47, 
            replies: 12, 
            timestamp: '2h ago',
            category: 'Cardio',
            liked: false,
            trending: true,
            createdAt: Date.now() - 7200000 // 2 hours ago
          },
          { 
            _id: 'expert_2', 
            user: { name: 'Sarah "Iron" Wilson', level: 'Pro Trainer', avatar: '💪', verified: true }, 
            content: 'Meal prep Sunday complete! 💯 This week: lean protein, complex carbs, and healthy fats. Consistency is everything in this game. Drop your meal prep tips below! 🥗', 
            likes: 89, 
            replies: 23, 
            timestamp: '4h ago',
            category: 'Nutrition',
            liked: true,
            trending: true,
            createdAt: Date.now() - 14400000 // 4 hours ago
          },
          { 
            _id: 'expert_3', 
            user: { name: 'Mike "Tank" Chen', level: 'Strength Coach', avatar: '🔥', verified: true }, 
            content: 'NEW DEADLIFT PR: 405lbs! 🚀 Form over ego, always. Took me 2 years to get here safely. Progressive overload and patience pays off. What\'s your current PR?', 
            likes: 156, 
            replies: 34, 
            timestamp: '6h ago',
            category: 'Strength',
            liked: false,
            trending: true,
            createdAt: Date.now() - 21600000 // 6 hours ago
          }
        ];
        
        // Combine and sort by creation time (newest first)
        const allPosts = [...savedPosts, ...expertPosts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setPosts(allPosts);
        setTotalPosts(allPosts.length);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading posts:', error);
        setIsLoading(false);
      }
    };
    
    loadPosts();
  }, []);

  // Save posts to localStorage whenever posts change
  const savePosts = (newPosts) => {
    try {
      // Only save user posts (not expert posts)
      const userPosts = newPosts.filter(post => !post._id.startsWith('expert_'));
      localStorage.setItem('gymtracker_forum_posts', JSON.stringify(userPosts));
    } catch (error) {
      console.error('Error saving posts:', error);
    }
  };

  // Get relative time string
  const getRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Real-time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const userTimer = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 20) - 10);
    }, 5000);
    return () => {
      clearInterval(timer);
      clearInterval(userTimer);
    };
  }, []);

  const categories = [
    { name: 'General', icon: '💬', color: 'blue' },
    { name: 'Strength', icon: '💪', color: 'red' },
    { name: 'Cardio', icon: '🏃', color: 'green' },
    { name: 'Nutrition', icon: '🥗', color: 'orange' },
    { name: 'Transformation', icon: '🔥', color: 'purple' },
    { name: 'Motivation', icon: '⚡', color: 'yellow' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      const now = Date.now();
      const post = {
        _id: `user_${now}`,
        user: { 
          name: user?.name || 'Elite Athlete', 
          level: 'Member', 
          avatar: '🔥', 
          verified: false 
        },
        content: newPost.trim(),
        likes: 0,
        replies: 0,
        timestamp: 'now',
        category: selectedCategory,
        liked: false,
        trending: false,
        createdAt: now
      };
      
      const updatedPosts = [post, ...posts];
      setPosts(updatedPosts);
      savePosts(updatedPosts);
      setTotalPosts(updatedPosts.length);
      setNewPost('');
      
      // Show success message
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
      
      // Simulate real-time engagement
      setTimeout(() => {
        const postsWithEngagement = updatedPosts.map(p => 
          p._id === post._id 
            ? { ...p, likes: Math.floor(Math.random() * 5) + 1 }
            : p
        );
        setPosts(postsWithEngagement);
        savePosts(postsWithEngagement);
      }, 5000);
    }
  };

  const handleLike = (postId) => {
    const updatedPosts = posts.map(post => 
      post._id === postId 
        ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked }
        : post
    );
    setPosts(updatedPosts);
    savePosts(updatedPosts);
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'trending') return post.trending;
    if (activeFilter === 'recent') return true;
    return post.category.toLowerCase() === activeFilter.toLowerCase();
  });

  // Update timestamps in real-time
  useEffect(() => {
    const updateTimestamps = () => {
      setPosts(currentPosts => 
        currentPosts.map(post => ({
          ...post,
          timestamp: post.createdAt ? getRelativeTime(post.createdAt) : post.timestamp
        }))
      );
    };
    
    const interval = setInterval(updateTimestamps, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-white font-body">
              🔴 LIVE COMMUNITY • {liveUsers.toLocaleString()} ATHLETES ONLINE
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading text-white mb-4">ELITE ATHLETES FORUM</h1>
          <p className="text-slate-400 font-body max-w-2xl mx-auto">
            Connect with certified trainers, elite athletes, and fitness enthusiasts. Share your journey, get expert advice, and motivate each other.
          </p>
          <div className="mt-4 text-xs text-slate-500 font-body">
            Live Updates • {currentTime.toLocaleTimeString()} • Real-time Discussions
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <div className="card">
              <h3 className="text-lg font-heading text-white mb-4">CATEGORIES</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setActiveFilter(category.name.toLowerCase())}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 font-body ${
                      activeFilter === category.name.toLowerCase()
                        ? 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-400'
                        : 'bg-slate-800/40 hover:bg-slate-700/50 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="card">
              <h3 className="text-lg font-heading text-white mb-4">FILTERS</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveFilter('trending')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 font-body ${
                    activeFilter === 'trending'
                      ? 'bg-orange-600/20 border border-orange-500/30 text-orange-400'
                      : 'bg-slate-800/40 hover:bg-slate-700/50 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-lg">🔥</span>
                  <span className="font-medium">Trending</span>
                </button>
                <button
                  onClick={() => setActiveFilter('recent')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 font-body ${
                    activeFilter === 'recent'
                      ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                      : 'bg-slate-800/40 hover:bg-slate-700/50 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-lg">⏰</span>
                  <span className="font-medium">Recent</span>
                </button>
              </div>
            </div>

            {/* Live Stats */}
            <div className="card">
              <h3 className="text-lg font-heading text-white mb-4">LIVE STATS</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-body text-sm">Online Now</span>
                  <span className="text-green-400 font-bold font-body">{liveUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-body text-sm">Total Posts</span>
                  <span className="text-blue-400 font-bold font-body">{totalPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-body text-sm">User Posts</span>
                  <span className="text-purple-400 font-bold font-body">{posts.filter(p => !p._id.startsWith('expert_')).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Success Message */}
            {postSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-green-600/20 border border-green-500/30 mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-green-400 font-body">Journey Shared Successfully!</div>
                    <div className="text-sm text-green-300 font-body">Your fitness journey is now visible to the entire GymTracker community. Keep inspiring others!</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Create Post */}
            {isAuthenticated() ? (
              <div className="card">
                <h3 className="text-lg font-heading text-white mb-4">SHARE YOUR FITNESS JOURNEY</h3>
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 text-sm">🔴</span>
                    <span className="text-blue-400 font-semibold text-sm font-body">REAL-TIME POSTING</span>
                  </div>
                  <p className="text-slate-300 text-xs font-body">
                    Your journey will be instantly visible to all {liveUsers.toLocaleString()} online athletes and stored permanently in our community.
                  </p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-white font-body text-sm">{user?.name || 'Elite Athlete'}</div>
                      <div className="text-xs text-slate-400 font-body">Member • Online Now</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white font-body text-sm focus:outline-none focus:border-cyan-500/50"
                    >
                      {categories.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your workout achievements, nutrition discoveries, transformation milestones, training tips, or motivational stories. Your journey inspires others! 💪"
                    className="w-full p-4 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 font-body resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-500 font-body">
                      {newPost.length}/500 characters
                    </span>
                    <span className="text-xs text-green-400 font-body">
                      ✓ Auto-saved • Visible to all users
                    </span>
                  </div>
                  <div className="flex justify-end mt-4">
                    <motion.button
                      type="submit"
                      disabled={!newPost.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 font-body"
                    >
                      🚀 Share Journey
                    </motion.button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card bg-slate-800/40 border border-slate-600/30">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-lg font-heading text-white mb-2">JOIN THE COMMUNITY</h3>
                  <p className="text-slate-400 font-body mb-4">
                    Login to share your fitness journey with {liveUsers.toLocaleString()} elite athletes worldwide
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button 
                      onClick={() => window.location.href = '/login'}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-body transition-colors"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => window.location.href = '/register'}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-body transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400 font-body">Loading community posts...</p>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-6">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">📝</div>
                      <h3 className="text-lg font-heading text-white mb-2">NO POSTS YET</h3>
                      <p className="text-slate-400 font-body">
                        Be the first to share your fitness journey in this category!
                      </p>
                    </div>
                  ) : (
                    filteredPosts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="card hover:scale-[1.01] transition-all duration-300 relative"
                  >
                    {post.trending && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                        🔥 TRENDING
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {post.user.avatar}
                        </div>
                        {post.user.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white font-body">{post.user.name}</h4>
                          {post.user.verified && <span className="text-blue-400 text-xs">✓</span>}
                          <span className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300 font-body">
                            {post.user.level}
                          </span>
                          <span className="text-xs text-slate-500 font-body">• {post.timestamp}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-body ${
                            post.category === 'Strength' ? 'bg-red-600/20 text-red-400' :
                            post.category === 'Cardio' ? 'bg-green-600/20 text-green-400' :
                            post.category === 'Nutrition' ? 'bg-orange-600/20 text-orange-400' :
                            post.category === 'Transformation' ? 'bg-purple-600/20 text-purple-400' :
                            'bg-blue-600/20 text-blue-400'
                          }`}>
                            {post.category}
                          </span>
                        </div>
                        
                        <p className="text-slate-300 mb-4 font-body leading-relaxed">{post.content}</p>
                        
                        <div className="flex items-center gap-6">
                          <motion.button 
                            onClick={() => handleLike(post._id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`flex items-center gap-2 transition-colors font-body ${
                              post.liked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
                            }`}
                          >
                            <span>{post.liked ? '❤️' : '🤍'}</span>
                            <span className="text-sm font-semibold">{post.likes}</span>
                          </motion.button>
                          
                          <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors font-body">
                            <span>💬</span>
                            <span className="text-sm">{post.replies} replies</span>
                          </button>
                          
                          <button className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors font-body">
                            <span>🔄</span>
                            <span className="text-sm">Share</span>
                          </button>
                          
                          <button className="flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors font-body ml-auto">
                            <span>⭐</span>
                            <span className="text-sm">Save</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    </motion.div>
                  ))
                  )}
                </div>
              </AnimatePresence>
            )}

            {/* Community Stats */}
            <div className="text-center">
              <div className="card bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
                <div className="text-center">
                  <h3 className="text-lg font-heading text-white mb-4">COMMUNITY IMPACT</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-400 font-body">{totalPosts}</div>
                      <div className="text-xs text-slate-400 font-body">Total Journeys</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400 font-body">{posts.reduce((sum, p) => sum + p.likes, 0)}</div>
                      <div className="text-xs text-slate-400 font-body">Total Likes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400 font-body">{liveUsers.toLocaleString()}</div>
                      <div className="text-xs text-slate-400 font-body">Active Users</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-body mt-4">
                    Every journey shared inspires others to achieve their fitness goals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}