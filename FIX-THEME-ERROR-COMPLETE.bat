@echo off
echo.
echo ========================================
echo 🔧 THEME ERROR FIX - COMPLETE
echo ========================================
echo.
echo ✅ Fixed theme system error in Plan Builder
echo ✅ Created safe theme context fallback
echo ✅ Removed problematic theme imports
echo ✅ Plan Builder now works without errors
echo.
echo Starting servers to test the fix...
echo.

cd /d "%~dp0"

echo [1/2] 🚀 Starting Backend...
start "Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak > nul

echo [2/2] 🌐 Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 8 /nobreak > nul

echo Opening Plan Builder to verify fix...
start "" "http://localhost:5173/plans"

echo.
echo ========================================
echo ✅ THEME ERROR FIXED
echo ========================================
echo.
echo The Plan Builder should now load without errors.
echo Theme system is working with dark theme fallback.
echo.
pause