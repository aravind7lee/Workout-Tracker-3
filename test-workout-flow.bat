@echo off
echo ========================================
echo TESTING WORKOUT TRACKER - COMPLETE FIX
echo ========================================
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
echo 3. Opening browser to test the application...
start http://localhost:5173

echo.
echo ========================================
echo TEST INSTRUCTIONS:
echo ========================================
echo 1. Click "Try Demo Account" to login
echo 2. Navigate to Exercise Library
echo 3. Click "Start Workout" on any exercise
echo 4. Add some sets with reps and weight
echo 5. Click "Finish Workout"
echo 6. Verify success notification appears
echo 7. Check that workout is saved (online or offline)
echo.
echo The 500 error should now be COMPLETELY FIXED!
echo ========================================

pause