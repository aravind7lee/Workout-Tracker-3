import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing MongoDB Connection...\n');
console.log('📋 Connection Details:');
console.log('   URI:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@')); // Hide password
console.log('   Attempting connection...\n');

const testConnection = async () => {
  try {
    // Try with extended timeout
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ SUCCESS! MongoDB Connected!');
    console.log('📊 Connection State:', mongoose.connection.readyState);
    console.log('🗄️  Database Name:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in database:', collections.map(c => c.name).join(', ') || 'None yet');
    
    // Count users
    const User = mongoose.connection.collection('users');
    const userCount = await User.countDocuments();
    console.log('👥 Total users in database:', userCount);
    
    console.log('\n✅ MongoDB is working perfectly!');
    console.log('✅ Your signup should work now!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!');
    console.error('❌ Error:', error.message);
    console.error('\n🔧 DIAGNOSIS:');
    
    if (error.message.includes('ETIMEOUT') || error.message.includes('querySrv')) {
      console.error('\n🚨 NETWORK/IP WHITELIST ISSUE:');
      console.error('   1. Go to: https://cloud.mongodb.com/');
      console.error('   2. Click "Network Access" in LEFT SIDEBAR (🌐 icon)');
      console.error('   3. Click "ADD IP ADDRESS" button');
      console.error('   4. Select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)');
      console.error('   5. Click "Confirm"');
      console.error('   6. WAIT 2-3 MINUTES for changes to apply');
      console.error('   7. Run this test again: node test-mongodb-connection.js');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n🔑 AUTHENTICATION ISSUE:');
      console.error('   - Check username/password in .env file');
      console.error('   - Verify user exists in Database Access');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n🌐 DNS/INTERNET ISSUE:');
      console.error('   - Check your internet connection');
      console.error('   - Try: ping cluster0.ipujo7u.mongodb.net');
    }
    
    console.error('\n📞 If issue persists, check:');
    console.error('   - MongoDB Atlas cluster is not PAUSED');
    console.error('   - Your internet/firewall allows MongoDB connections');
    console.error('   - Port 27017 is not blocked');
    
    process.exit(1);
  }
};

testConnection();
