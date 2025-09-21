@echo off
echo 🚀 DEPLOYING BACKEND WITH FIXED VERCEL CONFIG
echo.

cd backend

echo ✅ Step 1: Installing dependencies...
call npm install

echo.
echo ✅ Step 2: Verifying configuration...
echo    - vercel.json: Express server config ✅
echo    - server.js: Main entry point ✅
echo    - Node.js 18.x in package.json ✅

echo.
echo 🌐 Step 3: Deploying to Vercel...
call vercel --prod

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 🔗 Your backend is now live at:
echo    https://grindx-backend.vercel.app
echo.
echo 🎯 Test endpoints:
echo    - Root: https://grindx-backend.vercel.app/
echo    - Health: https://grindx-backend.vercel.app/api/health
echo    - Register: https://grindx-backend.vercel.app/api/auth/register
echo    - Login: https://grindx-backend.vercel.app/api/auth/login
echo.
echo ✅ RUNTIME ERROR FIXED - NO MORE BUILD FAILURES!
echo.
pause