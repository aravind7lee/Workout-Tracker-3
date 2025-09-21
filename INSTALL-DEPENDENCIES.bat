@echo off
cls
echo ========================================
echo    INSTALLING NUTRITION DEPENDENCIES
echo ========================================
echo.

echo Installing backend dependencies...
cd backend
npm install axios
echo ✅ Backend axios installed

echo.
echo Installing frontend dependencies...
cd ../frontend
npm install framer-motion
echo ✅ Frontend framer-motion installed

echo.
echo ========================================
echo    DEPENDENCIES INSTALLATION COMPLETE
echo ========================================
echo.
echo Backend dependencies:
echo ✅ axios - For Nutritionix API calls
echo.
echo Frontend dependencies:
echo ✅ framer-motion - For smooth animations
echo.
echo Now you can start the servers:
echo 1. Backend: cd backend && npm start
echo 2. Frontend: cd frontend && npm run dev
echo.
pause