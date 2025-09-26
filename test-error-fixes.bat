@echo off
echo 🔧 Testing Error Fixes...
echo.

echo Starting frontend development server...
cd frontend
npm run dev

echo.
echo ✅ Error fixes applied:
echo - Fixed fetchPriority prop warning
echo - Added JSON parsing error handling
echo - Enhanced Chrome extension error suppression
echo - Added comprehensive error suppression utilities
echo - Updated error boundaries
echo.
echo Open http://localhost:5173 to test the application
echo Check browser console - it should be clean of errors!
pause