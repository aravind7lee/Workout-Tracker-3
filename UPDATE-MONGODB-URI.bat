@echo off
echo ========================================
echo    UPDATE MONGODB CONNECTION STRING
echo ========================================
echo.
echo Your current connection string is INCOMPLETE!
echo.
echo Please get your COMPLETE connection string from MongoDB Atlas:
echo 1. Go to: https://cloud.mongodb.com
echo 2. Click "Database" → "Connect" → "Connect your application"
echo 3. Copy the FULL connection string
echo 4. Replace ^<password^> with: workoutpass123
echo.
echo Example of CORRECT format:
echo mongodb+srv://workouttracker:workoutpass123@cluster0.abc12.mongodb.net/gym-tracker?retryWrites=true^&w=majority
echo.
set /p newUri="Paste your COMPLETE connection string here: "

if "%newUri%"=="" (
    echo Error: No connection string provided!
    pause
    exit /b 1
)

:: Validate the connection string
echo %newUri% | findstr "mongodb+srv://" >nul
if %errorlevel% neq 0 (
    echo Error: Invalid connection string format!
    echo It should start with: mongodb+srv://
    pause
    exit /b 1
)

:: Update .env file
cd /d "%~dp0backend"
powershell -Command "(Get-Content .env) -replace 'MONGO_URI=.*', 'MONGO_URI=%newUri%' | Set-Content .env"

echo.
echo ✅ MongoDB URI updated successfully!
echo.
echo Testing connection...
node -e "const mongoose = require('mongoose'); mongoose.connect('%newUri%').then(() => { console.log('✅ MongoDB Connected Successfully!'); process.exit(0); }).catch(err => { console.log('❌ Connection failed:', err.message); process.exit(1); });"

if %errorlevel% equ 0 (
    echo.
    echo 🎉 SUCCESS! Your MongoDB is now working!
    echo.
    echo Starting your backend server...
    npm start
) else (
    echo.
    echo ❌ Connection still failing. Please check:
    echo 1. Username/password are correct
    echo 2. IP address is whitelisted (0.0.0.0/0)
    echo 3. Connection string is complete
)

pause