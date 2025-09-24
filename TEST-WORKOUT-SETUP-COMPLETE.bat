@echo off
echo ========================================
echo WORKOUT SETUP MODAL - COMPLETE TEST
echo ========================================
echo.

echo 🚀 Starting complete workout flow test...
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
echo 3. Opening application for testing...
start http://localhost:5173

echo.
echo ========================================
echo PROFESSIONAL WORKOUT SETUP TEST:
echo ========================================
echo.
echo 1. Login with demo account
echo 2. Go to Exercise Library
echo 3. Click "🎯 Start Workout" on any exercise
echo 4. ✨ NEW: Workout Setup Modal appears!
echo 5. Configure:
echo    - Target Sets (e.g., 4)
echo    - Target Reps (e.g., 12)
echo    - Starting Weight (e.g., 25kg)
echo    - Rest Time (e.g., 90s)
echo    - Optional notes
echo 6. Try Quick Presets (Strength, Hypertrophy, etc.)
echo 7. Click "🚀 Start Workout"
echo 8. See progress bar showing X/Y sets completed
echo 9. Add sets and finish workout
echo 10. Verify "✅ Saved online!" message
echo.
echo ✅ FEATURES TO TEST:
echo ========================================
echo ✨ Professional workout setup modal
echo 📊 Progress tracking with target sets
echo ⚡ Quick preset configurations
echo 🎯 Real-time progress indicators
echo 💾 MongoDB database persistence
echo 🌐 Online mode functionality
echo.
echo 🎉 PROFESSIONAL GYM TRACKER EXPERIENCE!
echo ========================================

pause