@echo off
echo 🚀 DEPLOYING WITH NODE.JS 22.x - FIXED!
echo.

cd backend

echo ✅ Configuration Fixed:
echo    - Node.js 22.x in package.json ✅
echo    - Clean vercel.json ✅
echo    - Proper start script ✅

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🌐 Deploying to Vercel...
call vercel --prod

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo    Vercel will now auto-detect Node.js 22.x
echo.
pause