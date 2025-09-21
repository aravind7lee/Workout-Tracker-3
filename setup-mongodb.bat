@echo off
echo ========================================
echo    MongoDB Setup for Workout Tracker
echo ========================================
echo.

echo Checking if MongoDB is installed...
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB is not installed!
    echo.
    echo Please choose an option:
    echo 1. Install MongoDB Community Server locally
    echo 2. Use MongoDB Atlas (Cloud Database - Recommended)
    echo.
    echo For Option 1 - Local Installation:
    echo - Download from: https://www.mongodb.com/try/download/community
    echo - Install MongoDB Community Server
    echo - Run this script again
    echo.
    echo For Option 2 - MongoDB Atlas (Recommended):
    echo - Go to: https://cloud.mongodb.com
    echo - Create free account
    echo - Create new cluster
    echo - Get connection string
    echo - Update backend/.env file
    echo.
    pause
    exit /b 1
)

echo MongoDB is installed! Starting MongoDB service...
net start MongoDB
if %errorlevel% neq 0 (
    echo Failed to start MongoDB service. Trying to install service...
    mongod --install --serviceName MongoDB --serviceDisplayName "MongoDB" --logpath "C:\data\log\mongod.log" --dbpath "C:\data\db"
    net start MongoDB
)

echo.
echo MongoDB is now running!
echo Database URL: mongodb://localhost:27017/gym-tracker
echo.
echo Starting backend server...
cd backend
npm start