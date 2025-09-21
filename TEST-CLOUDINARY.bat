@echo off
cls
echo ========================================
echo    CLOUDINARY INTEGRATION TEST
echo ========================================
echo.
echo Testing Cloudinary connection with your credentials:
echo Cloud Name: dtqahgnzn
echo API Key: 871169168893627
echo.

cd backend

echo Starting backend server...
echo.
echo Expected output:
echo ✅ Cloudinary connected successfully
echo 🌐 Cloud Name: dtqahgnzn
echo ✅ DB Connected
echo 🚀 Server running on port 5000
echo.

node server.js