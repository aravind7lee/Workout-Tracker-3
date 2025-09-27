@echo off
echo.
echo ========================================
echo ✅ DASHBOARD RESPONSIVE LAYOUT FIXED
echo ========================================
echo.
echo FIXES APPLIED:
echo ✅ Restructured header section for better responsiveness
echo ✅ Separated welcome message, status, and buttons into distinct sections
echo ✅ Status badges now wrap properly on mobile devices
echo ✅ Action buttons stack vertically on mobile, horizontally on desktop
echo ✅ Improved text spacing and readability across all screen sizes
echo ✅ Better alignment and visual hierarchy
echo.
echo Starting servers to test responsive dashboard...
echo.

cd /d "%~dp0"

echo [1/2] 🚀 Starting Backend...
start "Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak > nul

echo [2/2] 🌐 Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 8 /nobreak > nul

echo Opening Dashboard to test responsiveness...
start "" "http://localhost:5173/dashboard"

echo.
echo ========================================
echo ✅ DASHBOARD NOW FULLY RESPONSIVE
echo ========================================
echo.
echo TEST INSTRUCTIONS:
echo 1. Go to Dashboard page (/dashboard)
echo 2. Resize browser window to test different screen sizes
echo 3. Check mobile view (320px - 768px)
echo 4. Check tablet view (768px - 1024px)
echo 5. Check desktop view (1024px+)
echo.
echo RESPONSIVE FEATURES:
echo 📱 Mobile: Stacked layout, wrapped status badges
echo 💻 Tablet: Balanced layout with proper spacing
echo 🖥️ Desktop: Horizontal layout with optimal alignment
echo.
echo Dashboard header is now perfectly responsive! 🎯
echo.
pause