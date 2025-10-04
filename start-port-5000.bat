@echo off
title Workout Tracker - Port 5000
echo ========================================
echo    WORKOUT TRACKER - PORT 5000 SETUP
echo ========================================
echo.

echo Step 1: Killing any processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo   - Killing process ID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo Step 2: Killing any processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo   - Killing process ID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo Step 3: Starting Backend Server on Port 5000...
cd backend
start "Backend Server - Port 5000" cmd /k "echo Starting backend on port 5000... && npm start"

echo Step 4: Waiting for backend to initialize...
timeout /t 8 /nobreak >nul

echo Step 5: Testing backend connection...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ Backend is running on port 5000!
) else (
    echo   ❌ Backend failed to start on port 5000
    echo   Please check the backend terminal for errors
    pause
    exit /b 1
)

echo.
echo Step 6: Starting Frontend Development Server...
cd ..\frontend
start "Frontend Server" cmd /k "echo Starting frontend... && npm run dev"

echo.
echo ========================================
echo    🚀 APPLICATION STARTED SUCCESSFULLY!
echo ========================================
echo.
echo 🔗 Frontend:     http://localhost:3000
echo 🔗 Backend API:  http://localhost:5000/api/health
echo 🔗 Backend Test: http://localhost:5000/api/health
echo.
echo Both servers are running in separate windows.
echo Close this window when you're done.
echo.
pause