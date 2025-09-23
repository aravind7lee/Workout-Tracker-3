@echo off
echo ========================================
echo   WORKOUT TRACKER - ONLINE MODE READY
echo ========================================
echo.
echo Backend URL: https://workout-tracker-backend-wga7.onrender.com
echo Database: MongoDB
echo.
echo Features Added:
echo - Online/Offline detection
echo - Backend API integration
echo - MongoDB data synchronization
echo - Hybrid data management
echo - Real-time status indicators
echo.
echo Starting the application...
echo.

cd /d "%~dp0"

echo Installing dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo Starting frontend development server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   APPLICATION STARTED SUCCESSFULLY
echo ========================================
echo.
echo The application will automatically:
echo - Connect to your MongoDB backend
echo - Show online/offline status
echo - Sync data when online
echo - Work offline when backend is down
echo.
echo Backend Status will be shown on login page
echo Navigate to: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul