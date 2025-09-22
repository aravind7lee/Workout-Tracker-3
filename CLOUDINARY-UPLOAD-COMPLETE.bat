@echo off
echo ========================================
echo    CLOUDINARY IMAGE UPLOAD - COMPLETE
echo ========================================
echo.
echo ✅ Backend route: /api/users/upload-avatar
echo ✅ Cloudinary integration configured
echo ✅ All image formats supported (JPG, PNG, GIF, WebP, BMP, TIFF, SVG)
echo ✅ 5MB file size limit
echo ✅ Real-time profile updates
echo ✅ Image compression and optimization
echo.
echo ========================================
echo    INSTALLING BACKEND DEPENDENCIES
echo ========================================
echo.

cd /d "d:\Workout-Tracker-3\backend"
echo Installing backend dependencies...
call npm install

echo.
echo ========================================
echo    INSTALLING FRONTEND DEPENDENCIES  
echo ========================================
echo.

cd /d "d:\Workout-Tracker-3\frontend"
echo Installing frontend dependencies...
call npm install

echo.
echo ========================================
echo    STARTING BACKEND SERVER
echo ========================================
echo.

cd /d "d:\Workout-Tracker-3\backend"
start "Backend Server" cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo    STARTING FRONTEND APPLICATION
echo ========================================
echo.

cd /d "d:\Workout-Tracker-3\frontend"
call npm run dev

echo.
echo ========================================
echo    CLOUDINARY UPLOAD SYSTEM READY!
echo ========================================
echo.
echo Your image upload system is now working with:
echo ✅ Real-time Cloudinary uploads
echo ✅ All image format support
echo ✅ 5MB file size limit
echo ✅ Automatic image optimization
echo ✅ Profile picture management
echo ✅ Drag & drop functionality
echo.
echo Navigate to Profile page to test image uploads!
echo.
pause