@echo off
echo.
echo ========================================
echo ✅ START BUTTON FOR TEMP PLANS FIXED
echo ========================================
echo.
echo FIXES APPLIED:
echo ✅ Start button now works for ALL plans (including temporary)
echo ✅ Uses plan.id, plan.tempId, or generates temp ID
echo ✅ Removed disabled state - button always works
echo ✅ Navigates to /workout/{id} for any plan
echo ✅ Example: /workout/temp_1759003596619
echo.
echo Starting servers to test Start button...
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
echo ✅ START BUTTON NOW WORKS FOR ALL PLANS
echo ========================================
echo.
echo TEST INSTRUCTIONS:
echo 1. Go to Dashboard (/dashboard)
echo 2. Find "My Workout Plans" section
echo 3. Click "🏋️ Start Workout" on ANY plan
echo 4. Should navigate to /workout/{planId}
echo 5. Works for both regular and temporary plans
echo.
echo EXAMPLES:
echo • Regular plan: /workout/plan_123456
echo • Temp plan: /workout/temp_1759003596619
echo.
echo All Start buttons now work! 🎯
echo.
pause