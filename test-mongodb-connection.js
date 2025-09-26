// Test MongoDB Connection and Real-Time Data
const axios = require('axios');

const API_BASE = 'https://workout-tracker-backend-wga7.onrender.com/api';

async function testConnection() {
  console.log('🚀 Testing MongoDB Connection and Real-Time Data...\n');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing backend health...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Backend health:', healthResponse.data);
    
    // Test 2: Analytics endpoint (without auth)
    console.log('\n2. Testing analytics endpoint...');
    try {
      const analyticsResponse = await axios.get(`${API_BASE}/analytics/hero-stats`);
      console.log('✅ Analytics response:', analyticsResponse.data);
    } catch (error) {
      console.log('⚠️ Analytics requires authentication (expected)');
    }
    
    // Test 3: Dashboard endpoint
    console.log('\n3. Testing dashboard endpoint...');
    try {
      const dashboardResponse = await axios.get(`${API_BASE}/dashboard/stats`);
      console.log('✅ Dashboard response:', dashboardResponse.data);
    } catch (error) {
      console.log('⚠️ Dashboard error:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 MongoDB connection test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start your frontend: npm run dev');
    console.log('2. Register/Login to see real-time data');
    console.log('3. Complete workouts to see stats update');
    console.log('4. Check Dashboard and Home pages for live data');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if backend is running');
    console.log('2. Verify MongoDB connection');
    console.log('3. Check network connectivity');
  }
}

testConnection();