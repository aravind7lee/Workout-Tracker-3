@echo off
cls
echo ========================================
echo    GET YOUR CORRECT MONGODB ATLAS URI
echo ========================================
echo.
echo Your current MongoDB URI is INCOMPLETE!
echo.
echo ❌ Current: cluster0.mongodb.net
echo ✅ Correct: cluster0.XXXXX.mongodb.net
echo.
echo To get your CORRECT connection string:
echo.
echo 1. Go to: https://cloud.mongodb.com
echo 2. Login to your MongoDB Atlas account
echo 3. Click "Database" in the left sidebar
echo 4. Find your cluster and click "Connect"
echo 5. Choose "Connect your application"
echo 6. Select "Node.js" and version "4.1 or later"
echo 7. Copy the connection string
echo.
echo The connection string should look like:
echo mongodb+srv://^<username^>:^<password^>@cluster0.abc12.mongodb.net/^<database^>?retryWrites=true^&w=majority
echo.
echo Replace:
echo - ^<username^> with: workouttracker
echo - ^<password^> with: workoutpass123  
echo - ^<database^> with: gym-tracker
echo.
echo Example of CORRECT format:
echo mongodb+srv://workouttracker:workoutpass123@cluster0.abc12.mongodb.net/gym-tracker?retryWrites=true^&w=majority
echo.
set /p correctUri="Paste your COMPLETE MongoDB Atlas connection string here: "

if "%correctUri%"=="" (
    echo.
    echo ❌ No connection string provided!
    echo Please get the correct string from MongoDB Atlas.
    pause
    exit /b 1
)

:: Validate format
echo %correctUri% | findstr "cluster0\." >nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ Invalid format! The URL should contain "cluster0.XXXXX.mongodb.net"
    echo Please get the complete connection string from MongoDB Atlas.
    pause
    exit /b 1
)

:: Update .env file
cd /d "%~dp0backend"
powershell -Command "(Get-Content .env) -replace 'MONGO_URI=.*', 'MONGO_URI=%correctUri%' | Set-Content .env"

echo.
echo ✅ MongoDB URI updated successfully!
echo.
echo Testing connection...
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect('%correctUri%').then(() => { console.log('✅ DB Connected - Professional MERN Stack Ready!'); process.exit(0); }).catch(err => { console.log('❌ Connection failed:', err.message); process.exit(1); });"

if %errorlevel% equ 0 (
    echo.
    echo 🎉 SUCCESS! Your MongoDB Atlas is now working!
    echo.
    echo Starting your backend server...
    echo You should see: "✅ DB Connected"
    echo.
    npm start
) else (
    echo.
    echo ❌ Connection still failing. Please verify:
    echo 1. Username and password are correct
    echo 2. Database user has read/write permissions
    echo 3. IP address 0.0.0.0/0 is whitelisted in Network Access
    echo 4. Connection string is complete and correct
)

pause