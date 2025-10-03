import './utils/comprehensiveErrorHandler'; // Must be first to catch all errors
import './utils/immediateCleanup'; // Clean fake workouts immediately
import React, { useState, useEffect } from 'react';
import { Routes, Route, useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { RealTimeProvider } from './context/RealTimeContext';
import { StreakProvider } from './context/StreakContext';
import { AchievementsProvider } from './context/AchievementsContext';
import { WorkoutCompletionProvider } from './context/WorkoutCompletionContext';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LibrarySimple from './pages/LibrarySimple';
import Analytics from './pages/Analytics';
import Nutrition from './pages/Nutrition';
import PlansBuilder from './pages/PlansBuilder';
import MyPlans from './pages/MyPlans';
import EditPlan from './pages/EditPlan';
import WorkoutSession from './pages/WorkoutSession';
import Achievements from './pages/Achievements';
import ProfileAdvanced from './pages/ProfileAdvanced';
import Settings from './pages/Settings';
import Forum from './pages/Forum';
import Contact from './pages/Contact';
import StartWorkout from './pages/StartWorkout';
import XPPoints from './pages/XPPoints';
import CurrentStreakFixed from './pages/CurrentStreakFixed';
const CurrentStreak = CurrentStreakFixed; // Use fixed version
import StreakTest from './pages/StreakTest';
import Workouts from './pages/Workouts';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ChromeErrorBoundary from './components/ChromeErrorBoundary';
import ThemeErrorBoundary from './components/ThemeErrorBoundary';
import DemoBanner from './components/DemoBanner';
import DemoFloatingControls from './components/DemoFloatingControls';
import DemoFeatureTracker from './components/DemoFeatureTracker';
import WorkoutCompletionHandler from './components/WorkoutCompletionHandler';
import { DemoProvider } from './context/DemoContext';
import Register from './pages/Register';
import Login from './pages/Login';
import LegendsAndInfluencers from './pages/LegendsAndInfluencers';
import chromeErrorHandler from './utils/chromeErrorHandler';
import './utils/finalErrorCleanup'; // Stop continuous API calls
import './utils/silentMode'; // Complete console silence
import './utils/errorSuppression'; // Suppress import errors
import { realTimeStreakSync } from './services/realTimeStreakSync'; // Initialize real-time streak sync
import './utils/testWorkoutCompletion'; // Test utilities for real-time updates
import './utils/cleanupFakeWorkouts'; // Cleanup fake workouts
import './styles/button-improvements.css'; // Global button improvements

// Inline components to avoid module loading errors
const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);

  const exercises = [
    { id: 1, name: 'Push-ups', category: 'Chest', difficulty: 'Beginner' },
    { id: 2, name: 'Squats', category: 'Legs', difficulty: 'Beginner' },
    { id: 3, name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate' },
    { id: 4, name: 'Deadlifts', category: 'Back', difficulty: 'Advanced' },
    { id: 5, name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate' }
  ];

  useEffect(() => {
    if (query) {
      const filtered = exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(query.toLowerCase()) ||
        exercise.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-4">Search Results</h1>
      {query && <p className="text-gray-400 mb-6">Results for: "{query}"</p>}
      <div className="space-y-4">
        {results.map((exercise) => (
          <div key={exercise.id} className="bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-white mb-2">{exercise.name}</h3>
            <div className="flex items-center space-x-4 mb-4">
              <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm">
                {exercise.category}
              </span>
              <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm">
                {exercise.difficulty}
              </span>
            </div>
            <button 
              onClick={() => navigate(`/exercises/${exercise.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Details
            </button>
          </div>
        ))}
        {results.length === 0 && query && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
            <p className="text-gray-400">Try different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);

  const exercises = {
    1: { id: 1, name: 'Push-ups', category: 'Chest', difficulty: 'Beginner', description: 'Classic bodyweight exercise' },
    2: { id: 2, name: 'Squats', category: 'Legs', difficulty: 'Beginner', description: 'Fundamental leg exercise' },
    3: { id: 3, name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', description: 'Upper body pulling exercise' },
    4: { id: 4, name: 'Deadlifts', category: 'Back', difficulty: 'Advanced', description: 'Compound lifting movement' },
    5: { id: 5, name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate', description: 'Chest pressing exercise' }
  };

  useEffect(() => {
    const exerciseData = exercises[id] || exercises[1];
    setExercise(exerciseData);
  }, [id]);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [userReviews, setUserReviews] = useState([]);

  // Load user reviews on component mount
  useEffect(() => {
    try {
      const savedReviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || '[]');
      setUserReviews(savedReviews);
    } catch (error) {
      setUserReviews([]);
    }
  }, [id]);

  const handleSubmitReview = () => {
    if (userRating > 0) {
      try {
        const reviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || '[]');
        const newReview = {
          id: Date.now(),
          rating: userRating,
          comment: userComment,
          author: 'You',
          avatar: '👤',
          date: new Date().toLocaleDateString(),
          helpful: 0
        };
        const updatedReviews = [newReview, ...reviews];
        localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));
        setUserReviews(updatedReviews);
        
        // Reset form
        setShowReviewForm(false);
        setUserRating(0);
        setUserComment('');
      } catch (error) {
        console.error('Error saving review:', error);
      }
    }
  };

  if (!exercise) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:text-blue-800">
        ← Back
      </button>
      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-4">{exercise.name}</h1>
        <div className="flex items-center space-x-4 mb-6">
          <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full">
            {exercise.category}
          </span>
          <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full">
            {exercise.difficulty}
          </span>
        </div>
        <p className="text-gray-400 mb-6">{exercise.description}</p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Start Exercise
        </button>
        
        {/* Inline Review System */}
        <div className="mt-8 bg-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Reviews & Ratings</h3>
          
          {/* Rating Display */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {[1,2,3,4,5].map(star => (
                <span key={star} className="text-yellow-400 text-xl">★</span>
              ))}
            </div>
            <span className="text-gray-400">4.8 (24 reviews)</span>
          </div>
          
          {/* Write Review Section */}
          {!showReviewForm ? (
            <button 
              onClick={() => setShowReviewForm(true)}
              className="mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✍️ Write a Review
            </button>
          ) : (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border">
              <h4 className="font-semibold text-white mb-3">Write Your Review</h4>
              
              {/* Star Rating Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      <span className={star <= userRating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Comment Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Comment</label>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Share your experience with this exercise..."
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  rows={3}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={userRating === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setUserRating(0);
                    setUserComment('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* User Reviews */}
          <div className="space-y-4">
            {/* User's own reviews */}
            {userReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-600 pb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{review.avatar}</span>
                  <span className="font-medium text-white">{review.author}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    ))}
                  </div>
                  {review.author === 'You' && (
                    <span className="px-2 py-1 bg-green-900 text-green-200 rounded-full text-xs">
                      Your Review
                    </span>
                  )}
                </div>
                {review.comment && (
                  <p className="text-gray-300 mb-2">{review.comment}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{review.date}</span>
                  <button className="hover:text-blue-600">👍 Helpful ({review.helpful})</button>
                </div>
              </div>
            ))}
            
            {/* Sample Reviews */}
            <div className="border-b border-gray-600 pb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">👨💼</span>
                <span className="font-medium text-white">Alex Johnson</span>
                <div className="flex">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-2">
                Excellent exercise! Really helped build my strength and the instructions are clear.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>2 days ago</span>
                <button className="hover:text-blue-600">👍 Helpful (5)</button>
              </div>
            </div>
            
            <div className="border-b border-gray-600 pb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">👩🦰</span>
                <span className="font-medium text-white">Sarah Wilson</span>
                <div className="flex">
                  {[1,2,3,4].map(star => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                  <span className="text-gray-300">★</span>
                </div>
              </div>
              <p className="text-gray-300 mb-2">
                Great for beginners! Perfect form demonstration and easy to follow.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>1 week ago</span>
                <button className="hover:text-blue-600">👍 Helpful (3)</button>
              </div>
            </div>
            
            <div className="pb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">👨🎓</span>
                <span className="font-medium text-white">Mike Chen</span>
                <div className="flex">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-2">
                Challenging but effective. Saw results quickly after adding this to my routine.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>2 weeks ago</span>
                <button className="hover:text-blue-600">👍 Helpful (8)</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // Initialize Chrome error handler and real-time streak sync
  useEffect(() => {
    console.log('🛡️ Chrome error handler initialized');
    
    // Initialize real-time streak synchronization
    realTimeStreakSync.initialize();
    console.log('🔥 Real-time streak sync initialized');
    
    // Cleanup on unmount
    return () => {
      realTimeStreakSync.destroy();
    };
  }, []);

  return (
    <ChromeErrorBoundary>
      <ErrorBoundary>
        <ThemeErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <RealTimeProvider>
                <StreakProvider>
                  <AchievementsProvider>
                    <WorkoutCompletionProvider>
                      <DemoProvider>
                  <div className="min-h-screen">
                    <Navbar />
                    <DemoBanner />
                    <DemoFloatingControls />
                    <DemoFeatureTracker />
                    <WorkoutCompletionHandler />
                    <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/library" element={<LibrarySimple />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/nutrition" element={<Nutrition />} />
                      <Route path="/plans" element={<PlansBuilder />} />
                      <Route path="/my-plans" element={<MyPlans />} />
                      <Route path="/edit-plan/:planId" element={<EditPlan />} />
                      <Route path="/workout/:planId" element={<WorkoutSession />} />
                      <Route path="/achievements" element={<Achievements />} />
                      <Route path="/profile" element={<ProfileAdvanced />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/forum" element={<Forum />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/start-workout" element={<StartWorkout />} />
                      <Route path="/xp-points" element={<XPPoints />} />
                      <Route path="/current-streak" element={<CurrentStreakFixed />} />
                      <Route path="/streak-test" element={<StreakTest />} />
                      <Route path="/workouts" element={<Workouts />} />
                      <Route path="/legends" element={<LegendsAndInfluencers />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/exercises/:id" element={<ExerciseDetail />} />
                    </Routes>
                    </main>
                    <Footer />
                  </div>
                      </DemoProvider>
                    </WorkoutCompletionProvider>
                  </AchievementsProvider>
                </StreakProvider>
              </RealTimeProvider>
            </AuthProvider>
          </ThemeProvider>
        </ThemeErrorBoundary>
      </ErrorBoundary>
    </ChromeErrorBoundary>
  );
}