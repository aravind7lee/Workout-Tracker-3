@echo off
echo ========================================
echo    COMPLETE HERO COMPONENT FIX
echo ========================================
echo.

echo 🔧 Step 1: Installing dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🧹 Step 2: Clearing cache and build artifacts...
rmdir /s /q node_modules\.vite 2>nul
rmdir /s /q dist 2>nul
del package-lock.json 2>nul
call npm install

echo.
echo 🔍 Step 3: Testing backend connection...
cd ..
node test-backend-connection.js
if %errorlevel% neq 0 (
    echo ⚠️  Backend connection issues detected
    echo 💡 Starting local backend as fallback...
    cd backend
    start "Backend Server" cmd /k "npm start"
    timeout /t 5 /nobreak >nul
    cd ..
)

echo.
echo 🚀 Step 4: Starting frontend development server...
cd frontend
echo 📝 Starting Vite dev server on http://localhost:5173
echo 🌟 Hero component has been completely fixed!
echo.
echo ✅ FIXES APPLIED:
echo    - Fixed isAuthenticated function call
echo    - Added proper error handling
echo    - Fixed image import path
echo    - Added fallback gradient background
echo    - Added Hero-specific CSS styles
echo    - Improved loading states
echo    - Added safe localStorage access
echo.
echo 🎯 The Hero component should now work without 500 errors!
echo.

call npm run dev

pause