@echo off
echo Testing Workout Tracker Fix...

echo.
echo 1. Checking backend dependencies...
cd backend
call npm list --depth=0

echo.
echo 2. Checking frontend dependencies...
cd ..\frontend
call npm list --depth=0

echo.
echo 3. Starting backend server (will run for 10 seconds)...
cd ..\backend
start "Backend Test" cmd /c "timeout /t 10 && npm run dev"

echo.
echo 4. Waiting for backend to start...
timeout /t 5

echo.
echo 5. Testing API endpoint...
curl -s http://localhost:5000/api/exercises?simple=true

echo.
echo 6. Starting frontend (will open browser)...
cd ..\frontend
start "Frontend Test" cmd /c "npm run dev"

echo.
echo Test complete! Check if:
echo - Backend shows "Server running on port 5000"
echo - Frontend opens at http://localhost:5173
echo - "Start Tracking Now" button works
echo.
pause