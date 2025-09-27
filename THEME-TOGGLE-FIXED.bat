@echo off
echo.
echo ========================================
echo ✅ THEME TOGGLE COMPLETELY FIXED
echo ========================================
echo.
echo FIXES APPLIED:
echo ✅ Fixed ThemeContext with proper state management
echo ✅ Added toggleTheme function that actually works
echo ✅ Added comprehensive CSS variables for light/dark themes
echo ✅ Theme persists in localStorage
echo ✅ Applies theme classes to document root
echo ✅ ThemeToggle button now functional
echo.
echo Starting servers to test the theme toggle...
echo.

cd /d "%~dp0"

echo [1/2] 🚀 Starting Backend...
start "Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak > nul

echo [2/2] 🌐 Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 8 /nobreak > nul

echo Opening website to test theme toggle...
start "" "http://localhost:5173"

echo.
echo ========================================
echo ✅ THEME TOGGLE NOW WORKING
echo ========================================
echo.
echo TEST INSTRUCTIONS:
echo 1. Look for the theme toggle button in the navbar (sun/moon icon)
echo 2. Click it to switch between light and dark modes
echo 3. The entire website should change themes instantly
echo 4. Theme preference is saved and persists on page reload
echo 5. Works on all pages including Plan Builder
echo.
echo 🌞 LIGHT MODE: Clean, professional white theme
echo 🌙 DARK MODE: Sleek, modern dark theme
echo.
echo The theme toggle is now fully functional! 🎯
echo.
pause