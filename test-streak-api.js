// Simple test script to verify streak API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

let authToken = '';

async function testStreakAPI() {
  try {
    console.log('🧪 Testing Streak API...');
    
    // 1. Register or login user
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      authToken = registerResponse.data.token;
      console.log('✅ User registered successfully');
    } catch (error) {
      // User might already exist, try login
      try {
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        authToken = loginResponse.data.token;
        console.log('✅ User logged in successfully');
      } catch (loginError) {
        console.error('❌ Failed to login:', loginError.response?.data || loginError.message);
        return;
      }
    }

    const headers = { Authorization: `Bearer ${authToken}` };

    // 2. Test streak status endpoint
    console.log('\n📊 Testing streak status...');
    try {
      const statusResponse = await axios.get(`${API_BASE}/users/streak/status`, { headers });
      console.log('✅ Streak status:', statusResponse.data);
    } catch (error) {
      console.error('❌ Streak status failed:', error.response?.data || error.message);
    }

    // 3. Test streak check-in endpoint
    console.log('\n🔥 Testing streak check-in...');
    try {
      const checkinResponse = await axios.post(`${API_BASE}/users/streak/check-in`, {}, { headers });
      console.log('✅ Streak check-in:', checkinResponse.data);
    } catch (error) {
      console.error('❌ Streak check-in failed:', error.response?.data || error.message);
    }

    // 4. Test streak status again to see updated data
    console.log('\n📊 Testing streak status after check-in...');
    try {
      const statusResponse2 = await axios.get(`${API_BASE}/users/streak/status`, { headers });
      console.log('✅ Updated streak status:', statusResponse2.data);
    } catch (error) {
      console.error('❌ Updated streak status failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStreakAPI();