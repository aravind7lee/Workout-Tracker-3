// Simple App.jsx for testing
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import HomeSimple from './pages/Home-simple';
import Register from './pages/Register';
import Login from './pages/Login';

export default function AppSimple() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-900 text-white">
        <Routes>
          <Route path="/" element={<HomeSimple />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                <a href="/" className="text-blue-400 hover:text-blue-300">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </ThemeProvider>
  );
}