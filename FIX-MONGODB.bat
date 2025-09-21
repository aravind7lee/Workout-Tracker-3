@echo off
cls
echo ========================================
echo    MONGODB SETUP - WORKOUT TRACKER
echo ========================================
echo.

echo Choose your MongoDB setup option:
echo.
echo 1. Quick Setup - Use MongoDB Atlas (Cloud - Recommended)
echo 2. Install MongoDB Locally (Advanced)
echo 3. Continue without database (Limited features)
echo.
set /p choice="Enter your choice (1, 2, or 3): "

if "%choice%"=="1" goto atlas
if "%choice%"=="2" goto local
if "%choice%"=="3" goto nodatabase
goto invalid

:atlas
echo.
echo ========================================
echo     MONGODB ATLAS CLOUD SETUP
echo ========================================
echo.
echo Follow these steps:
echo.
echo 1. Open: https://cloud.mongodb.com
echo 2. Sign up for FREE account
echo 3. Create new project: "Workout Tracker"
echo 4. Create cluster: M0 Sandbox (FREE)
echo 5. Database Access: Add user
echo    - Username: workouttracker
echo    - Password: workoutpass123
echo 6. Network Access: Add IP Address
echo    - Click "Allow Access from Anywhere"
echo 7. Connect to cluster:
echo    - Choose "Connect your application"
echo    - Copy connection string
echo    - Replace ^<password^> with: workoutpass123
echo.
echo Example connection string:
echo mongodb+srv://workouttracker:workoutpass123@cluster0.xxxxx.mongodb.net/gym-tracker?retryWrites=true^&w=majority
echo.
set /p mongoUri="Paste your connection string here: "

if "%mongoUri%"=="" (
    echo Error: No connection string provided
    pause
    exit /b 1
)

:: Update .env file
cd /d "%~dp0backend"
powershell -Command "(Get-Content .env) -replace 'MONGO_URI=.*', 'MONGO_URI=%mongoUri%' | Set-Content .env"

echo.
echo ✅ Configuration updated!
echo.
echo Testing connection...
cd /d "%~dp0backend"
node -e "const mongoose = require('mongoose'); mongoose.connect('%mongoUri%').then(() => { console.log('✅ MongoDB Atlas connected!'); process.exit(0); }).catch(err => { console.log('❌ Connection failed:', err.message); process.exit(1); });"

if %errorlevel% equ 0 (
    echo.
    echo 🎉 SUCCESS! MongoDB Atlas is working!
    echo.
    echo Starting your application...
    start cmd /k "cd /d %~dp0backend && npm start"
    timeout /t 2 /nobreak >nul
    start cmd /k "cd /d %~dp0frontend && npm run dev"
) else (
    echo.
    echo ❌ Connection test failed. Please check your connection string.
)
goto end

:local
echo.
echo ========================================
echo      LOCAL MONGODB INSTALLATION
echo ========================================
echo.
echo This will download and install MongoDB Community Server...
echo.
set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" goto end

echo.
echo Checking if MongoDB is already installed...
where mongod >nul 2>&1
if %errorlevel% equ 0 (
    echo MongoDB is already installed!
    goto startlocal
)

echo.
echo Creating directories...
if not exist "C:\data\db" mkdir "C:\data\db"
if not exist "C:\data\log" mkdir "C:\data\log"

echo.
echo Please download and install MongoDB manually:
echo 1. Go to: https://www.mongodb.com/try/download/community
echo 2. Download MongoDB Community Server for Windows
echo 3. Run the installer with default settings
echo 4. Install as Windows Service
echo 5. Come back and press any key...
echo.
pause

:startlocal
echo.
echo Starting MongoDB service...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    echo MongoDB service not found. Starting manually...
    start "MongoDB" mongod --dbpath "C:\data\db"
    timeout /t 3 /nobreak >nul
)

:: Update .env to use local MongoDB
cd /d "%~dp0backend"
powershell -Command "(Get-Content .env) -replace 'MONGO_URI=.*', 'MONGO_URI=mongodb://localhost:27017/gym-tracker' | Set-Content .env"

echo.
echo ✅ Configuration updated for local MongoDB!
echo.
echo Starting your application...
start cmd /k "cd /d %~dp0backend && npm start"
timeout /t 2 /nobreak >nul
start cmd /k "cd /d %~dp0frontend && npm run dev"
goto end

:nodatabase
echo.
echo ========================================
echo       CONTINUE WITHOUT DATABASE
echo ========================================
echo.
echo Your app will work with localStorage (browser storage)
echo Features available:
echo ✅ User registration/login
echo ✅ Workout plans creation
echo ✅ Exercise library
echo ✅ Workout tracking
echo ✅ Profile management
echo.
echo ⚠️  Data will be stored locally in browser only
echo.
echo Starting your application...
start cmd /k "cd /d %~dp0backend && npm start"
timeout /t 2 /nobreak >nul
start cmd /k "cd /d %~dp0frontend && npm run dev"
goto end

:invalid
echo.
echo Invalid choice. Please run the script again.
pause
exit /b 1

:end
echo.
echo ========================================
echo           SETUP COMPLETE!
echo ========================================
echo.
echo Your Workout Tracker is now running:
echo.
echo 🖥️  Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000
echo 📊 Health:   http://localhost:5000/api/health
echo.
echo Press any key to exit...
pause >nul