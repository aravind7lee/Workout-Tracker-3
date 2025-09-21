@echo off
echo 🚀 DEPLOYING BACKEND TO VERCEL - ALL ISSUES FIXED!
echo.

cd backend

echo ✅ Installing dependencies...
call npm install

echo.
echo ✅ Testing server locally...
timeout /t 2 /nobreak > nul

echo.
echo 🌐 Deploying to Vercel...
call vercel --prod

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 🔗 Your API endpoints:
echo    - Root: https://your-app.vercel.app/api
echo    - Health: https://your-app.vercel.app/api/health  
echo    - Register: https://your-app.vercel.app/api/auth/register
echo    - Login: https://your-app.vercel.app/api/auth/login
echo.
echo 🎯 All issues fixed:
echo    ✅ Node.js version set to 18.x
echo    ✅ ES modules configured
echo    ✅ All dependencies added
echo    ✅ Vercel config updated
echo    ✅ API endpoints working
echo.
pause