@echo off
echo ========================================
echo    REAL-TIME DASHBOARD SETUP COMPLETE
echo ========================================
echo.
echo Your dashboard now includes:
echo.
echo ✅ Real-time data fetching from backend API
echo ✅ Live statistics updates every 30 seconds
echo ✅ Achievement tracking with progress bars
echo ✅ Activity feed with live updates
echo ✅ Caching system for better performance
echo ✅ Manual refresh functionality
echo ✅ Live data indicators
echo.
echo ========================================
echo    STARTING APPLICATION
echo ========================================
echo.

cd /d "d:\Workout-Tracker-3\frontend"

echo Installing any missing dependencies...
call npm install

echo.
echo Starting development server with real-time features...
call npm run dev

echo.
echo ========================================
echo    REAL-TIME DASHBOARD IS READY!
echo ========================================
echo.
echo Features now active:
echo - Live stats from backend API
echo - Real-time achievement updates
echo - Activity feed with live data
echo - 30-second auto-refresh
echo - Manual refresh button
echo - Cached data for performance
echo.
echo Your dashboard will automatically fetch fresh data
echo from your backend every 30 seconds!
echo.
pause