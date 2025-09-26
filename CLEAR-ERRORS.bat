@echo off
echo ========================================
echo 🧹 CLEARING ALL ERRORS AND CACHE
echo ========================================
echo.

echo 🔄 Stopping any running processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im chrome.exe 2>nul

echo.
echo 🗑️ Clearing browser cache and data...
echo   - Close all Chrome windows
echo   - Press Ctrl+Shift+Delete in Chrome
echo   - Select "All time" and clear everything
echo.

echo 📦 Reinstalling dependencies...
cd frontend
call npm install --force
echo.

echo 🧹 Clearing npm cache...
call npm cache clean --force
echo.

echo 🔄 Restarting development server...
echo.
echo ✅ All errors should be cleared!
echo 🚀 Starting fresh development server...
echo.

call npm run dev

pause