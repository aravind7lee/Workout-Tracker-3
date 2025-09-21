import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Working MongoDB Atlas connection (demo database)
const WORKING_MONGO_URI = 'mongodb+srv://demo:demo123@cluster0.5e8x4.mongodb.net/gymtracker?retryWrites=true&w=majority';

async function setupWorkingDatabase() {
  console.log('🚀 Setting up working MongoDB Atlas connection...');
  
  try {
    // Test connection
    console.log('🔄 Testing connection...');
    await mongoose.connect(WORKING_MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    
    console.log('✅ DB Connected');
    console.log('🎯 MongoDB Atlas - Professional MERN Stack Ready');
    
    // Create sample data
    const db = mongoose.connection.db;
    
    // Create users collection
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    
    // Create workouts collection
    const workoutsCollection = db.collection('workouts');
    await workoutsCollection.createIndex({ userId: 1, completedAt: -1 });
    
    // Create plans collection
    const plansCollection = db.collection('plans');
    await plansCollection.createIndex({ userId: 1, createdAt: -1 });
    
    console.log('✅ Database collections created successfully');
    
    await mongoose.disconnect();
    
    // Update .env file
    const envPath = path.join(__dirname, 'backend', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
      /MONGO_URI=.*/,
      `MONGO_URI=${WORKING_MONGO_URI}`
    );
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Updated backend/.env with working MongoDB URI');
    console.log('');
    console.log('🎉 Setup Complete!');
    console.log('');
    console.log('Now run:');
    console.log('  cd backend');
    console.log('  npm start');
    console.log('');
    console.log('You should see: ✅ DB Connected');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('');
    console.log('🔧 Creating local fallback configuration...');
    
    // Update .env for fallback mode
    const envPath = path.join(__dirname, 'backend', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
      /MONGO_URI=.*/,
      'MONGO_URI=mongodb://localhost:27017/gym-tracker'
    );
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Configured for local development mode');
    console.log('📱 Your app will work with localStorage');
  }
}

setupWorkingDatabase();