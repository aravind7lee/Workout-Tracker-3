@echo off
echo Starting Workout Tracker Application...
echo.

REM Kill any existing processes on ports 5000 and 3000
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Development Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Application started successfully!
echo 🔗 Frontend: http://localhost:3000
echo 🔗 Backend API: http://localhost:5000/api/health
echo.
echo Press any key to exit...
pause >nul