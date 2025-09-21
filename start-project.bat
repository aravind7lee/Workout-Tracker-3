@echo off
echo Starting Workout Tracker Project...

echo.
echo 1. Seeding database with sample data...
cd backend
call npm run seed

echo.
echo 2. Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo 3. Starting frontend development server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Project started successfully!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause