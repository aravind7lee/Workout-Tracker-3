// Simple test to verify server components
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('🧪 Testing server components...');

// Test 1: Environment variables
console.log('✅ Environment variables loaded');
console.log('   PORT:', process.env.PORT || 5000);
console.log('   MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');

// Test 2: MongoDB connection
async function testMongoDB() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connection successful');
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnection successful');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

testMongoDB();