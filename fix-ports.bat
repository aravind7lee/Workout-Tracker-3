@echo off
echo Fixing Port Configuration...
echo.

REM Kill any processes on conflicting ports
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Killing process on port 5000: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo Port cleanup complete!
echo Backend will use port 5000
echo Frontend will use port 3000 (Vite default)
echo.

echo Starting application...
call start-app.bat