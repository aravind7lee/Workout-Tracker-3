@echo off
cls
echo ========================================
echo    NUTRITION API INTEGRATION TEST
echo ========================================
echo.
echo Testing Nutritionix API integration...
echo.
echo Expected features:
echo ✅ Real-time food analysis via Nutritionix API
echo ✅ Automatic macro calculation (calories, protein, carbs, fat)
echo ✅ MongoDB storage of meals and nutrition goals
echo ✅ Live progress tracking with visual indicators
echo ✅ Add/delete meals with instant total updates
echo ✅ Support for natural language queries (e.g., "2 eggs", "100g chicken")
echo.

cd backend

echo Starting backend server with Nutrition API...
echo.
echo Expected output:
echo ✅ Cloudinary connected successfully
echo ✅ DB Connected
echo 🚀 Server running on port 5000
echo 🎯 Nutrition API endpoints ready at /api/nutrition
echo.

node server.js