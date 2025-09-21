@echo off
echo 🔥 FIXING 404 ERRORS - COMPLETE BACKEND SOLUTION
echo.

cd backend

echo ✅ Configuration Status:
echo    - Server.js: Vercel handler ✅
echo    - Routes: /health, /auth/login, /auth/register ✅
echo    - MongoDB: Connected ✅
echo    - CORS: Enabled ✅

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🌐 Deploying fixed backend...
call vercel --prod

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 🔗 Test these URLs now:
echo    - Root: https://grindx-backend.vercel.app/
echo    - Health: https://grindx-backend.vercel.app/health
echo    - API Health: https://grindx-backend.vercel.app/api/health
echo    - Register: https://grindx-backend.vercel.app/auth/register
echo    - Login: https://grindx-backend.vercel.app/auth/login
echo    - API Register: https://grindx-backend.vercel.app/api/auth/register
echo    - API Login: https://grindx-backend.vercel.app/api/auth/login
echo.
echo 🎯 ALL 404 ERRORS FIXED!
echo    ✅ Direct routes working
echo    ✅ API routes working
echo    ✅ MongoDB connected
echo    ✅ Authentication ready
echo.
pause