@echo off
echo ========================================
echo TESTING ANALYTICS ERROR FIX
echo ========================================
echo.

echo 1. Testing backend connectivity...
node test-backend.js
echo.

echo 2. Starting frontend development server...
echo Open your browser to http://localhost:5173
echo Check the browser console - there should be NO analytics 404 errors
echo.

cd frontend
npm run dev