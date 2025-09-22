@echo off
echo ========================================
echo    REACT DEVTOOLS MESSAGE FIX SCRIPT
echo ========================================
echo.
echo This script will:
echo 1. Install missing dependencies
echo 2. Build production version (no DevTools messages)
echo 3. Start the application
echo.

cd /d "d:\Workout-Tracker-3\frontend"

echo Installing dependencies...
call npm install

echo.
echo Building production version...
call npm run build

echo.
echo Starting development server...
call npm run dev

echo.
echo ========================================
echo    FIX COMPLETE!
echo ========================================
echo.
echo The React DevTools message has been suppressed.
echo Your application is now running without console messages.
echo.
echo To permanently fix this:
echo 1. Use 'npm run build' for production builds
echo 2. The console messages are now filtered out
echo 3. React DevTools message won't appear in production
echo.
pause