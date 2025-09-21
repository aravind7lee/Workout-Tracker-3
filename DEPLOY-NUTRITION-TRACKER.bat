@echo off
echo 🚀 DEPLOYING REAL-TIME NUTRITION TRACKER TO RENDER
echo.

cd backend

echo ✅ New Features Added:
echo    - Real-time nutrition tracking API ✅
echo    - Professional macro tracking ✅
echo    - Food database with 10+ foods ✅
echo    - Meal CRUD operations ✅
echo    - User nutrition targets ✅

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🌐 Ready to deploy to Render:
echo    Backend URL: https://workout-tracker-backend-wga7.onrender.com
echo    New Endpoints:
echo      - GET /api/nutrition/users/me/targets
echo      - GET /api/nutrition/meals
echo      - GET /api/nutrition/meals/totals
echo      - POST /api/nutrition/meals
echo      - DELETE /api/nutrition/meals/:id
echo      - POST /api/nutrition/lookup

echo.
echo 🎯 PROFESSIONAL GYM FEATURES:
echo    ✅ Real-time macro tracking
echo    ✅ Goal-based nutrition (cut/bulk/maintain/recomp)
echo    ✅ Food database lookup
echo    ✅ Progress visualization
echo    ✅ Meal history tracking
echo    ✅ Optimistic UI updates

echo.
echo 🔥 Push your code to GitHub and Render will auto-deploy!
echo    Your nutrition tracker is now professional-grade!
echo.
pause