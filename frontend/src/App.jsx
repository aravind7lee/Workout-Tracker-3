// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard-simple';
import Library from './pages/Library';
import Analytics from './pages/Analytics';
import Nutrition from './pages/Nutrition';
import PlansBuilder from './pages/PlansBuilder';
import MyPlans from './pages/MyPlans';
import EditPlan from './pages/EditPlan';
import WorkoutSession from './pages/WorkoutSession';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Forum from './pages/Forum';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import Register from './pages/Register';
import Login from './pages/Login';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen">
          <Navbar />
          <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
          </main>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}