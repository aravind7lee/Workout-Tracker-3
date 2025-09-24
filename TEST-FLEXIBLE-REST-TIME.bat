@echo off
echo ========================================
echo FLEXIBLE REST TIME - COMPLETE TEST
echo ========================================
echo.

echo 🕐 Testing user-customizable rest times...
echo.

echo 1. Starting backend server...
cd backend
start "Backend Server" cmd /k "npm start"
timeout /t 5

echo.
echo 2. Starting frontend development server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 10

echo.
echo 3. Opening application for rest time testing...
start http://localhost:5173

echo.
echo ========================================
echo FLEXIBLE REST TIME TEST INSTRUCTIONS:
echo ========================================
echo.
echo 📋 STEP 1: Test WorkoutSetupModal Rest Options
echo ----------------------------------------
echo 1. Login (demo or real account)
echo 2. Go to Exercise Library
echo 3. Click "🎯 Start Workout" on any exercise
echo 4. ✨ In WorkoutSetupModal, test rest time options:
echo    - Use +/- buttons (15 second increments)
echo    - Type custom time (15 seconds to 15 minutes)
echo    - Try quick buttons: 30s, 45s, 1:00, 1:30, 2:00, 3:00
echo    - Try longer presets: 4 min, 5 min, 6 min, 8 min
echo    - Test different presets:
echo      * Quick (30s rest)
echo      * Endurance (45s rest)  
echo      * Hypertrophy (1.5 min rest)
echo      * Strength (3 min rest)
echo      * Heavy (4 min rest)
echo      * Power (5 min rest)
echo.
echo 📋 STEP 2: Test During Workout Rest Control
echo ----------------------------------------
echo 1. Start workout with any rest time
echo 2. In StartWorkout page, adjust rest time:
echo    - Use +/- buttons for current set
echo    - Type custom rest time
echo    - Use quick buttons: 30s, 1m, 1.5m, 2m, 3m
echo 3. Add a set and verify rest timer uses your time
echo 4. Change rest time between sets
echo.
echo 🕐 REST TIME OPTIONS TO TEST:
echo ----------------------------------------
echo ⚡ Quick Workouts: 15s, 30s, 45s
echo 💪 Standard: 60s, 90s, 120s
echo 🏋️ Strength: 180s, 240s, 300s
echo 🔥 Powerlifting: 360s, 480s, 600s+
echo 🎯 Custom: Any time from 15s to 15 minutes
echo.
echo ✅ EXPECTED BEHAVIOR:
echo ----------------------------------------
echo ✅ Rest time displays as MM:SS format
echo ✅ Quick buttons work for common times
echo ✅ +/- buttons adjust by 15 seconds
echo ✅ Custom input accepts any valid time
echo ✅ Presets show different rest times
echo ✅ Rest timer counts down from chosen time
echo ✅ Warning appears at 10 seconds remaining
echo ✅ Rest time saves with workout data
echo.
echo 🎯 USER SCENARIOS TO TEST:
echo ----------------------------------------
echo 👤 Beginner: 30-60 second rest times
echo 💪 Intermediate: 60-120 second rest times  
echo 🏋️ Advanced: 120-300 second rest times
echo 🔥 Powerlifter: 300-600 second rest times
echo ⚡ HIIT: 15-45 second rest times
echo 🎯 Custom: Any personal preference
echo.
echo 🎉 COMPLETE USER FLEXIBILITY ACHIEVED!
echo ========================================

pause