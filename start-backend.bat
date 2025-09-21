@echo off
echo Starting GYM Tracker Backend Server...
echo.

cd backend
echo Installing dependencies...
call npm install

echo.
echo Starting MongoDB (make sure MongoDB is installed)...
start "MongoDB" cmd /k "mongod --dbpath=C:\data\db"

timeout /t 3 /nobreak > nul

echo.
echo Starting Backend Server...
call npm run dev

pause