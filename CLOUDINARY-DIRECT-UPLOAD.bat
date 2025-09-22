@echo off
echo ========================================
echo    CLOUDINARY UPLOAD PRESET SETUP
echo ========================================
echo.
echo Setting up Cloudinary upload preset for direct uploads...
echo.
echo Your Cloudinary Details:
echo Cloud Name: dtqahgnzn
echo API Key: 871169168893627
echo.
echo ========================================
echo    MANUAL SETUP REQUIRED
echo ========================================
echo.
echo Please follow these steps to enable direct uploads:
echo.
echo 1. Go to: https://cloudinary.com/console
echo 2. Login with your account (dtqahgnzn)
echo 3. Go to Settings ^> Upload
echo 4. Scroll to "Upload presets"
echo 5. Click "Add upload preset"
echo 6. Set these values:
echo    - Preset name: workout_tracker_preset
echo    - Signing mode: Unsigned
echo    - Folder: workout-tracker/avatars
echo    - Transformation: w_400,h_400,c_fill,g_face,q_auto,f_auto
echo 7. Click "Save"
echo.
echo ========================================
echo    ALTERNATIVE: SIGNED UPLOAD SETUP
echo ========================================
echo.
echo If you prefer signed uploads (more secure):
echo 1. Keep preset as "Signed"
echo 2. We'll use backend API for uploads
echo.

cd /d "d:\Workout-Tracker-3\frontend"

echo Installing dependencies...
call npm install

echo.
echo Starting application...
call npm run dev

echo.
echo ========================================
echo    CLOUDINARY DIRECT UPLOAD READY!
echo ========================================
echo.
echo Features implemented:
echo ✅ Direct Cloudinary upload
echo ✅ Save to Cloud button
echo ✅ Image preview before upload
echo ✅ All image formats supported
echo ✅ 5MB file size validation
echo ✅ Cloud storage indicators
echo ✅ Professional UI/UX
echo.
echo Navigate to Profile page to test uploads!
echo.
echo Note: Make sure to create the upload preset
echo in your Cloudinary dashboard first.
echo.
pause