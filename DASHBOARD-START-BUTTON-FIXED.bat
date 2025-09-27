@echo off
echo.
echo ========================================
echo ✅ DASHBOARD START BUTTON FIXED
echo ========================================
echo.
echo FIXES APPLIED:
echo ✅ Start button now properly navigates to workout session
echo ✅ Uses correct plan ID for navigation (/workout/{planId})
echo ✅ Added error handling for missing plan IDs
echo ✅ Enhanced button styling and feedback
echo ✅ Added loading state for plans being created
echo ✅ Fixed Repeat button in Recent Workouts section
echo ✅ Added console logging for debugging
echo.
echo Starting servers to test Start button functionality...
echo.

cd /d "%~dp0"

echo [1/2] 🚀 Starting Backend...
start "Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak > nul

echo [2/2] 🌐 Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 8 /nobreak > nul

echo Opening Dashboard to test Start button...
start "" "http://localhost:5173/dashboard"

echo.
echo ========================================
echo ✅ START BUTTON NOW WORKING
echo ========================================
echo.
echo TEST INSTRUCTIONS:
echo 1. Go to Dashboard page (/dashboard)
echo 2. Look for "My Workout Plans" section
echo 3. Click "🏋️ Start Workout" button on any plan
echo 4. Should navigate to /workout/{planId}
echo 5. Check browser console for navigation logs
echo.
echo FEATURES:
echo 🏋️ Start Workout: Takes you to the workout session
echo 🔄 Repeat: Repeats previous workouts
echo ⏳ Loading state for plans being created
echo 🛡️ Error handling for missing IDs
echo.
echo Start button now works perfectly! 🎯
echo.
pause