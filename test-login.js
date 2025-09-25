// Test Login Functionality
const axios = require('axios');

const API_BASE = 'https://workout-tracker-backend-wga7.onrender.com/api';

async function testLogin() {
  console.log('🧪 Testing Login Functionality...\n');
  
  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    return;
  }
  
  // Test 2: Register a test user
  try {
    console.log('\n2️⃣ Testing User Registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'testpassword123'
    });
    console.log('✅ Registration:', registerResponse.data.message);
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ User already exists, continuing...');
    } else {
      console.log('❌ Registration Failed:', error.response?.data?.message || error.message);
    }
  }
  
  // Test 3: Login with the test user
  try {
    console.log('\n3️⃣ Testing User Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testuser@example.com',
      password: 'testpassword123'
    });
    console.log('✅ Login Successful:', loginResponse.data.user.email);
    console.log('🔑 Token received:', loginResponse.data.token ? 'Yes' : 'No');
  } catch (error) {
    console.log('❌ Login Failed:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
  }
  
  // Test 4: Login with wrong credentials
  try {
    console.log('\n4️⃣ Testing Wrong Credentials...');
    await axios.post(`${API_BASE}/auth/login`, {
      email: 'testuser@example.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    console.log('✅ Wrong credentials properly rejected:', error.response?.data?.message);
  }
  
  console.log('\n🎯 Test Complete!');
}

testLogin().catch(console.error);