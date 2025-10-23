@echo off
echo 🔧 Fixing Authentication Issues...
echo.

echo 📋 Step 1: Stopping any running processes on port 5000...
netstat -ano | findstr :5000 > nul
if %errorlevel% == 0 (
    echo Found process on port 5000, attempting to stop...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F > nul 2>&1
    timeout /t 2 > nul
)

echo 📋 Step 2: Starting backend server...
cd backend
start "Backend Server" cmd /k "npm start"
timeout /t 5

echo 📋 Step 3: Starting frontend...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Application restarted!
echo 🔗 Frontend: http://localhost:5173
echo 🔗 Backend: http://localhost:5000
echo.
echo 💡 If you still see authentication errors:
echo    1. Open browser console (F12)
echo    2. Run: localStorage.clear()
echo    3. Refresh the page and log in again
echo.
pause