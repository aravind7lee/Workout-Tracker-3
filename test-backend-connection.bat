@echo off
echo 🔗 Testing Backend Connection...
echo.

echo Testing backend health endpoint...
curl -X GET "https://workout-tracker-backend-wga7.onrender.com/api/health" -H "Content-Type: application/json"

echo.
echo.
echo Testing backend root endpoint...
curl -X GET "https://workout-tracker-backend-wga7.onrender.com/api" -H "Content-Type: application/json"

echo.
echo.
echo ✅ Backend connection test complete
echo If you see JSON responses above, your backend is working correctly
echo If you see HTML or errors, your backend needs to be started
pause