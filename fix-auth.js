// Fix authentication system
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a demo user token for testing
const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NmE4YjVmOGY0ZTIzNDU2NzEyMzQ1NiIsImVtYWlsIjoiZGVtb0B3b3Jrb3V0dHJhY2tlci5jb20iLCJpYXQiOjE3MzQ5NjAwMDAsImV4cCI6MTc0MjczNjAwMH0.demo_signature_for_testing';

const demoUser = {
  id: '676a8b5f8f4e23456712345',
  name: 'Demo User',
  email: 'demo@workouttracker.com',
  profileImage: null,
  bio: 'Welcome to Workout Tracker!'
};

console.log('🔧 Setting up demo authentication...');

// Update localStorage with demo data
const setupScript = `
// Demo authentication setup
localStorage.setItem('token', '${demoToken}');
localStorage.setItem('user', '${JSON.stringify(demoUser)}');
console.log('✅ Demo authentication configured');
console.log('User:', JSON.parse(localStorage.getItem('user')));
`;

fs.writeFileSync(path.join(__dirname, 'frontend', 'public', 'setup-demo-auth.js'), setupScript);

console.log('✅ Demo authentication setup complete!');
console.log('');
console.log('To use demo authentication:');
console.log('1. Open browser console on your app');
console.log('2. Run: localStorage.setItem("token", "' + demoToken + '")');
console.log('3. Run: localStorage.setItem("user", \'' + JSON.stringify(demoUser) + '\')');
console.log('4. Refresh the page');
console.log('');
console.log('Or include this script in your HTML:');
console.log('<script src="/setup-demo-auth.js"></script>');