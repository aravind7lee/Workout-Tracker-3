@echo off
echo ========================================
echo COMPLETE WORKOUT SETUP WORKFLOW TEST
echo ========================================
echo.

echo 🎯 Testing the EXACT workflow you requested...
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
echo 3. Opening simple modal test first...
start SIMPLE-MODAL-TEST.html

echo.
echo 4. Opening main application...
start http://localhost:5173

echo.
echo ========================================
echo EXACT WORKFLOW TO TEST:
echo ========================================
echo.
echo 📋 STEP 1: Test Simple Modal
echo ----------------------------------------
echo 1. Click "🎯 Start Workout (Test)" in HTML page
echo 2. Verify modal appears with configuration options
echo 3. Click "🚀 Start Workout" 
echo 4. Verify success message appears
echo.
echo 📋 STEP 2: Test Real Application
echo ----------------------------------------
echo 1. Login with demo account
echo 2. Go to Exercise Library
echo 3. Click "🎯 Start Workout" on ANY exercise
echo 4. ✨ WorkoutSetupModal SHOULD appear
echo 5. Configure: Sets, Reps, Weight, Rest Time
echo 6. Click "🚀 Start Workout" in modal
echo 7. Should navigate to StartWorkout page
echo 8. Timer should start with your configuration
echo.
echo 🔍 CONSOLE LOGS TO VERIFY:
echo ----------------------------------------
echo "💆 Start Workout button clicked for: [Exercise]"
echo "🎯 Opening workout setup modal for: [Exercise]"
echo "🔍 WorkoutSetupModal opened for: [Exercise]"
echo "📝 WorkoutSetupModal rendered for exercise: [Exercise]"
echo "🚀 Starting workout with config: [Config]"
echo "✅ Workout setup completed: [Exercise & Config]"
echo "🚀 Navigating to StartWorkout with config: [Config]"
echo.
echo ❌ IF MODAL DOESN'T APPEAR:
echo ----------------------------------------
echo 1. Check browser console for errors
echo 2. Verify all console logs appear
echo 3. Try refreshing and testing again
echo 4. Check if modal is behind other elements
echo 5. Ensure JavaScript is enabled
echo.
echo ✅ EXPECTED RESULT:
echo ----------------------------------------
echo Modal appears → Configure workout → Start workout → Timer begins
echo.
echo 🎉 THE WORKFLOW SHOULD WORK PERFECTLY NOW!
echo ========================================

pause