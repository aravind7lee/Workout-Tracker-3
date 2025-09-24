// Test Backend Connection Script
import axios from 'axios';

const API_BASE = 'https://workout-tracker-backend-wga7.onrender.com/api';
const LOCAL_API = 'http://localhost:5000/api';

async function testConnection(baseUrl, name) {
  console.log(`\n🔍 Testing ${name} connection...`);
  
  try {
    const response = await axios.get(`${baseUrl}/health`, { timeout: 10000 });
    console.log(`✅ ${name} is ONLINE`);
    console.log(`📊 Response:`, response.data);
    return true;
  } catch (error) {
    console.log(`❌ ${name} is OFFLINE`);
    console.log(`🔍 Error:`, error.message);
    return false;
  }
}

async function testWorkoutSave(baseUrl, name) {
  console.log(`\n💾 Testing workout save on ${name}...`);
  
  const testWorkout = {
    title: 'Test Workout',
    exercises: [{
      exercise: 'Push-ups',
      sets: [{ reps: 10, weight: 0, rest: 60 }],
      notes: 'Test workout'
    }],
    durationMinutes: 5,
    calories: 25,
    date: new Date().toISOString()
  };
  
  try {
    const response = await axios.post(`${baseUrl}/workouts`, testWorkout, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth but test the route
      }
    });
    
    console.log(`✅ ${name} workout endpoint is working`);
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`✅ ${name} workout endpoint is working (auth required)`);
      return true;
    } else {
      console.log(`❌ ${name} workout endpoint error:`, error.response?.status, error.response?.data || error.message);
      return false;
    }
  }
}

async function runTests() {
  console.log('🚀 BACKEND CONNECTION TEST');
  console.log('========================');
  
  // Test remote backend
  const remoteOnline = await testConnection(API_BASE, 'Remote Backend (Render)');
  if (remoteOnline) {
    await testWorkoutSave(API_BASE, 'Remote Backend');
  }
  
  // Test local backend
  const localOnline = await testConnection(LOCAL_API, 'Local Backend');
  if (localOnline) {
    await testWorkoutSave(LOCAL_API, 'Local Backend');
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('===========');
  console.log(`Remote Backend: ${remoteOnline ? '✅ ONLINE' : '❌ OFFLINE'}`);
  console.log(`Local Backend: ${localOnline ? '✅ ONLINE' : '❌ OFFLINE'}`);
  
  if (!remoteOnline && !localOnline) {
    console.log('\n⚠️  NO BACKENDS AVAILABLE');
    console.log('Please start your local backend with: cd backend && npm start');
  }
}

runTests().catch(console.error);