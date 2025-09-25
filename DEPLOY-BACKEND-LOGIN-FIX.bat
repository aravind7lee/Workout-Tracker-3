@echo off
echo 🚀 DEPLOYING BACKEND WITH LOGIN FIX...
echo.

cd backend

echo 📦 Installing dependencies...
call npm install

echo 🔧 Starting backend server...
call npm start

echo.
echo ✅ Backend deployed with login fixes:
echo    - Updated CORS configuration
echo    - Added frontend URL patterns
echo    - Increased timeout to 15 seconds
echo    - Better error handling
echo.
echo 🌐 Your backend should now work with your deployed frontend!
echo.
pause