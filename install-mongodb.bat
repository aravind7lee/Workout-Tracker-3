@echo off
echo ========================================
echo   MongoDB Installation for Windows
echo ========================================
echo.

echo Downloading MongoDB Community Server...
echo Please wait, this may take a few minutes...

:: Create MongoDB directory
if not exist "C:\mongodb" mkdir C:\mongodb
if not exist "C:\data\db" mkdir C:\data\db
if not exist "C:\data\log" mkdir C:\data\log

:: Download MongoDB (using PowerShell)
powershell -Command "& {Invoke-WebRequest -Uri 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.4-signed.msi' -OutFile 'C:\mongodb\mongodb-installer.msi'}"

echo.
echo Installing MongoDB...
echo Please follow the installation wizard:
echo 1. Choose "Complete" installation
echo 2. Install MongoDB as a Service
echo 3. Use default settings

:: Run installer
start /wait msiexec /i "C:\mongodb\mongodb-installer.msi" /quiet

echo.
echo Starting MongoDB service...
net start MongoDB

echo.
echo Testing MongoDB connection...
timeout /t 3 /nobreak >nul

:: Test if MongoDB is running
netstat -an | findstr :27017 >nul
if %errorlevel% equ 0 (
    echo ✅ MongoDB is running on port 27017
    echo.
    echo Updating backend configuration...
    
    :: Update .env file to use local MongoDB
    cd /d "%~dp0backend"
    powershell -Command "(Get-Content .env) -replace 'MONGO_URI=.*', 'MONGO_URI=mongodb://localhost:27017/gym-tracker' | Set-Content .env"
    
    echo ✅ Configuration updated!
    echo.
    echo Starting backend server...
    npm start
) else (
    echo ❌ MongoDB installation failed
    echo.
    echo Please try manual installation:
    echo 1. Go to: https://www.mongodb.com/try/download/community
    echo 2. Download MongoDB Community Server
    echo 3. Install with default settings
    echo 4. Run this script again
)

pause