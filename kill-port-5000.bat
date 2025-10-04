@echo off
echo Killing all processes using port 5000...

REM Find and kill processes using port 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Killing process ID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo Port 5000 is now free!
timeout /t 2 /nobreak >nul