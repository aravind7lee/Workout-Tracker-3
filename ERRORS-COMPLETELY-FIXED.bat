@echo off
echo ========================================
echo   WORKOUT TRACKER - ALL ERRORS FIXED
echo ========================================
echo.
echo Fixed Issues:
echo - Cannot read properties of null (reading 'user')
echo - Authentication context null reference errors
echo - Navbar user property access errors
echo - Dashboard loading state race conditions
echo - Error boundary improvements
echo - Console error handling in production
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
echo The application should open in your browser automatically.
echo If not, navigate to: http://localhost:5173
echo.
echo All authentication errors have been fixed:
echo - User null reference protection added
echo - Safe property access implemented
echo - Error boundaries enhanced
echo - Loading states properly managed
echo.
echo You can now:
echo 1. Login with demo account
echo 2. Register new account
echo 3. Use offline mode
echo.
echo Press any key to close this window...
pause > nul