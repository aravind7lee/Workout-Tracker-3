@echo off
echo Testing Backend Connection...
echo.

REM Start backend if not running
cd backend
echo Starting backend server...
start "Backend Test" cmd /k "npm start"

echo Waiting for server to start...
timeout /t 8 /nobreak >nul

echo Testing API endpoints...
curl -X GET http://localhost:5000/api/health
echo.
echo.

echo Backend test complete!
pause