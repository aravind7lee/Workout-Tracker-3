@echo off
echo ========================================
echo 🚀 WORKOUT TRACKER - ONLINE MODE SETUP
echo ========================================
echo.

echo 📋 Starting Real-Time MongoDB Workout Tracker...
echo.

echo 🔗 Backend URL: https://workout-tracker-backend-wga7.onrender.com
echo 💾 Database: MongoDB Atlas
echo 🔄 Mode: Real-Time Online Only
echo.

echo ⚡ Features Enabled:
echo   ✅ Real-time MongoDB data
echo   ✅ Live workout tracking
echo   ✅ Instant stats updates
echo   ✅ Cross-device sync
echo   ✅ Achievement system
echo   ✅ Streak tracking
echo   ✅ XP points system
echo.

echo 🧪 Testing MongoDB connection...
node test-mongodb-connection.js
echo.

echo 🎯 Starting frontend in ONLINE MODE...
echo.
echo 📱 Your app will open at: http://localhost:5173
echo 🔥 All data will be real-time from MongoDB
echo 💪 Complete workouts to see instant updates
echo.

cd frontend
npm run dev

pause