import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB Atlas Connection...');
    
    const MONGO_URI = process.env.MONGO_URI;
    console.log('📋 Connection String Format Check:');
    console.log('   URI starts with mongodb+srv://', MONGO_URI.startsWith('mongodb+srv://'));
    console.log('   Contains cluster identifier:', MONGO_URI.includes('.mongodb.net'));
    console.log('   Contains database name:', MONGO_URI.includes('gym-tracker'));
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    
    console.log('✅ DB Connected');
    console.log('🎯 MongoDB Atlas - Professional MERN Stack Ready');
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Connection Test Failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('');
      console.log('🔧 SOLUTION: Your MongoDB Atlas URL is incorrect');
      console.log('');
      console.log('Current URL format: cluster0.mongodb.net (WRONG)');
      console.log('Correct URL format: cluster0.XXXXX.mongodb.net (RIGHT)');
      console.log('');
      console.log('To fix this:');
      console.log('1. Go to https://cloud.mongodb.com');
      console.log('2. Click "Database" → "Connect" on your cluster');
      console.log('3. Choose "Connect your application"');
      console.log('4. Copy the COMPLETE connection string');
      console.log('5. It should look like: mongodb+srv://username:password@cluster0.abc12.mongodb.net/database');
      console.log('6. Update your backend/.env file with the COMPLETE string');
    }
  }
}

testConnection();