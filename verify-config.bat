@echo off
echo ========================================
echo    CONFIGURATION VERIFICATION
echo ========================================
echo.

echo Checking Backend Configuration:
echo --------------------------------
cd backend
findstr "PORT=5000" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend .env: PORT=5000
) else (
    echo ❌ Backend .env: PORT not set to 5000
)

echo.
echo Checking Frontend Configuration:
echo --------------------------------
cd ..\frontend
findstr "VITE_API_URL=http://localhost:5000/api" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend .env: VITE_API_URL=http://localhost:5000/api
) else (
    echo ❌ Frontend .env: VITE_API_URL not set correctly
)

echo.
echo Checking Port Availability:
echo --------------------------
netstat -an | findstr :5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 5000 is currently in use
    echo    Run kill-port-5000.bat to free it
) else (
    echo ✅ Port 5000 is available
)

netstat -an | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 is currently in use
) else (
    echo ✅ Port 3000 is available
)

echo.
echo Configuration check complete!
echo Run start-port-5000.bat to start the application.
echo.
pause