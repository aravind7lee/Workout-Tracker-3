// frontend/src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Library = lazy(() => import('./pages/Library'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const PlansBuilder = lazy(() => import('./pages/PlansBuilder'));
const MyPlans = lazy(() => import('./pages/MyPlans'));
const EditPlan = lazy(() => import('./pages/EditPlan'));
const WorkoutSession = lazy(() => import('./pages/WorkoutSession'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Forum = lazy(() => import('./pages/Forum'));
const Contact = lazy(() => import('./pages/Contact'));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen">
          <Navbar />
          <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/library" element={<Library />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/plans" element={<PlansBuilder />} />
                <Route path="/my-plans" element={<MyPlans />} />
                <Route path="/edit-plan/:planId" element={<EditPlan />} />
                <Route path="/workout/:planId" element={<WorkoutSession />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}