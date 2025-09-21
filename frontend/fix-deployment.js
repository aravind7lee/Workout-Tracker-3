// Deployment fix script
import { writeFileSync } from 'fs';

// Create a simple main.jsx for testing
const simpleMain = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Simple test component
function TestApp() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🏋️ GymTracker</h1>
        <p className="text-xl text-slate-300 mb-8">Your Fitness Journey Starts Here</p>
        <div className="space-x-4">
          <a href="/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Get Started
          </a>
          <a href="/login" className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TestApp />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
`;

console.log('Creating deployment test files...');
writeFileSync('./src/main-test.jsx', simpleMain);
console.log('✅ Test files created!');
console.log('To test: rename main-test.jsx to main.jsx and redeploy');