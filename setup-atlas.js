// MongoDB Atlas Setup Helper
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 MongoDB Atlas Setup Helper');
console.log('================================');
console.log('');

function updateEnvFile(mongoUri) {
  const envPath = path.join(__dirname, 'backend', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace MONGO_URI line
  envContent = envContent.replace(
    /MONGO_URI=.*/,
    `MONGO_URI=${mongoUri}`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated backend/.env file');
}

function askForConnectionString() {
  rl.question('📋 Paste your MongoDB Atlas connection string here: ', (connectionString) => {
    if (!connectionString || !connectionString.includes('mongodb+srv://')) {
      console.log('❌ Invalid connection string. Please try again.');
      console.log('💡 It should start with: mongodb+srv://');
      askForConnectionString();
      return;
    }
    
    // Ensure database name is set
    if (!connectionString.includes('/gym-tracker')) {
      connectionString = connectionString.replace('mongodb.net/', 'mongodb.net/gym-tracker');
    }
    
    updateEnvFile(connectionString);
    
    console.log('');
    console.log('🎉 Setup Complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. cd backend');
    console.log('2. npm start');
    console.log('');
    console.log('You should see: ✅ MongoDB connected successfully!');
    
    rl.close();
  });
}

console.log('Please follow these steps:');
console.log('');
console.log('1. Go to https://cloud.mongodb.com');
console.log('2. Create free account');
console.log('3. Create new cluster (M0 Sandbox - Free)');
console.log('4. Add database user: workouttracker / workoutpass123');
console.log('5. Add IP address: 0.0.0.0/0 (Allow from anywhere)');
console.log('6. Get connection string from "Connect" → "Connect your application"');
console.log('7. Replace <password> with: workoutpass123');
console.log('');

askForConnectionString();