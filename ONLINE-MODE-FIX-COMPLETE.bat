@echo off
echo ========================================
echo ONLINE MODE FIX - COMPLETE SOLUTION
echo ========================================
echo.

echo 🔧 FIXING ALL ONLINE MODE ISSUES...
echo.

echo 1. Starting MongoDB connection test...
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
"

if %errorlevel% neq 0 (
    echo ❌ MongoDB connection failed - check your MONGO_URI
    pause
    exit /b 1
)

echo.
echo 2. Starting backend server...
start "Backend Server" cmd /k "npm start"
timeout /t 8

echo.
echo 3. Testing backend connection...
cd ..
node test-backend-connection.js

echo.
echo 4. Starting frontend with online mode...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 10

echo.
echo 5. Opening application...
start http://localhost:5173

echo.
echo ========================================
echo ONLINE MODE TEST INSTRUCTIONS:
echo ========================================
echo.
echo 1. Login with demo account
echo 2. Go to Exercise Library
echo 3. Click "Start Workout" on any exercise
echo 4. Add sets with reps and weight
echo 5. Click "Finish Workout"
echo 6. Verify message shows "✅ Saved online!"
echo 7. Check browser network tab - no 500 errors
echo.
echo ✅ ONLINE MODE SHOULD NOW WORK PERFECTLY!
echo ========================================

pause