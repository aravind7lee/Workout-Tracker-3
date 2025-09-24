@echo off
echo ========================================
echo WORKOUT SETUP MODAL - DEBUG TEST
echo ========================================
echo.

echo 🔍 Testing WorkoutSetupModal functionality...
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
echo 3. Opening application for modal testing...
start http://localhost:5173

echo.
echo ========================================
echo DEBUG TEST INSTRUCTIONS:
echo ========================================
echo.
echo 1. Open browser console (F12)
echo 2. Login with demo account
echo 3. Go to Exercise Library
echo 4. Click "🎯 Start Workout" on any exercise
echo.
echo 🔍 EXPECTED CONSOLE LOGS:
echo ========================================
echo "👆 Start Workout button clicked for: [Exercise Name]"
echo "🎯 Opening workout setup modal for: [Exercise Name]"
echo "📝 WorkoutSetupModal rendered for exercise: [Exercise Name]"
echo "🔍 showWorkoutSetup state: [Exercise Name]"
echo.
echo 📋 EXPECTED BEHAVIOR:
echo ========================================
echo ✅ Modal should appear immediately after clicking
echo ✅ Modal should show exercise details
echo ✅ Modal should have configuration options
echo ✅ Modal should have "🚀 Start Workout" button
echo.
echo ❌ IF MODAL DOESN'T APPEAR:
echo - Check console for error messages
echo - Verify all logs are appearing
echo - Check if modal is behind other elements
echo.
echo 🎯 MODAL SHOULD WORK PERFECTLY NOW!
echo ========================================

pause