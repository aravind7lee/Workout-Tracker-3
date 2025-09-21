@echo off
cls
echo ========================================
echo    FIXING NUTRITION API ERROR
echo ========================================
echo.

echo Step 1: Removing axios dependency...
cd backend
if exist node_modules\axios (
    rmdir /s /q node_modules\axios
    echo ✅ Removed axios
) else (
    echo ℹ️ Axios not found
)

echo.
echo Step 2: Installing required dependencies...
npm install

echo.
echo Step 3: Testing server startup...
echo Expected output:
echo ✅ Cloudinary connected successfully
echo ✅ DB Connected
echo 🚀 Server running on port 5000
echo 🎯 Nutrition API ready (using built-in fetch)
echo.

echo Starting server...
node server.js