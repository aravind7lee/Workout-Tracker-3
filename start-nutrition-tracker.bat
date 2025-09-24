@echo off
echo 🚀 Starting GymTracker with Real-Time Nutrition Tracker...
echo.

echo 📦 Installing dependencies...
cd backend
call npm install
cd ../frontend
call npm install
cd ..

echo.
echo 🔧 Starting Backend Server...
start "GymTracker Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo 🌐 Starting Frontend Development Server...
start "GymTracker Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ GymTracker is starting up!
echo 📱 Frontend: http://localhost:5173
echo 🔗 Backend: http://localhost:5000
echo.
echo 🍽️ Features Available:
echo   ✓ Real-time Nutritionix API integration
echo   ✓ Pre-populated food categories
echo   ✓ Comprehensive fallback database
echo   ✓ MongoDB persistence
echo   ✓ Animated UI with progress tracking
echo.
echo Press any key to exit...
pause > nul