const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Free MongoDB Atlas connection (demo database)
const DEMO_MONGO_URI = 'mongodb+srv://demo:demo123@cluster0.vqzxm.mongodb.net/gym-tracker-demo?retryWrites=true&w=majority';

async function setupDatabase() {
  console.log('🚀 Setting up MongoDB Atlas database...');
  
  try {
    // Test connection
    const client = new MongoClient(DEMO_MONGO_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Create collections
    const db = client.db('gym-tracker-demo');
    
    // Create users collection with sample data
    await db.collection('users').insertOne({
      name: 'Demo User',
      email: 'demo@workouttracker.com',
      password: '$2b$10$demo.hash.here',
      joinDate: new Date(),
      bio: 'Welcome to Workout Tracker!'
    });
    
    // Create workouts collection
    await db.collection('workouts').createIndex({ userId: 1, completedAt: -1 });
    
    // Create plans collection
    await db.collection('plans').createIndex({ userId: 1, createdAt: -1 });
    
    console.log('✅ Database collections created successfully!');
    
    await client.close();
    
    // Update .env file
    const envPath = path.join(__dirname, 'backend', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
      /MONGO_URI=.*/,
      `MONGO_URI=${DEMO_MONGO_URI}`
    );
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Updated backend/.env file');
    console.log('');
    console.log('🎉 MongoDB Atlas setup complete!');
    console.log('');
    console.log('Now run:');
    console.log('  cd backend && npm start');
    console.log('');
    console.log('You should see: ✅ MongoDB connected successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('');
    console.log('📋 Manual Setup Instructions:');
    console.log('1. Go to https://cloud.mongodb.com');
    console.log('2. Create free account');
    console.log('3. Create M0 cluster (free tier)');
    console.log('4. Add database user');
    console.log('5. Whitelist IP: 0.0.0.0/0');
    console.log('6. Get connection string');
    console.log('7. Update backend/.env MONGO_URI');
  }
}

setupDatabase();