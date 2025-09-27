@echo off
echo.
echo ========================================
echo 🚀 REAL-TIME MY WORKOUT PLANS - COMPLETE SYSTEM TEST
echo ========================================
echo.
echo ✅ INSTANT DASHBOARD UPDATES
echo ✅ REAL-TIME MONGODB INTEGRATION  
echo ✅ PROFESSIONAL GYM-LEVEL EXPERIENCE
echo ✅ CROSS-DEVICE SYNCHRONIZATION
echo.
echo Testing Components:
echo 📋 My Plans Page - Real-time plan management
echo 📊 Dashboard - Instant counter updates
echo 🏗️ Plan Builder - Real-time creation
echo ☁️ MongoDB - Professional data persistence
echo ⚡ Event System - Instant UI updates
echo.
echo ========================================
echo 🔥 STARTING REAL-TIME SYSTEM TEST...
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] 🚀 Starting Backend (MongoDB + Real-time API)...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak > nul

echo [2/5] 🌐 Starting Frontend (Real-time UI)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo [3/5] 📊 Opening Dashboard (Instant Updates)...
timeout /t 8 /nobreak > nul
start "" "http://localhost:5173/dashboard"

echo [4/5] 📋 Opening My Plans (Real-time Management)...
timeout /t 2 /nobreak > nul
start "" "http://localhost:5173/my-plans"

echo [5/5] 🏗️ Opening Plan Builder (Real-time Creation)...
timeout /t 2 /nobreak > nul
start "" "http://localhost:5173/plans"

echo.
echo ========================================
echo 🎯 REAL-TIME TESTING INSTRUCTIONS
echo ========================================
echo.
echo 1. 📋 CREATE A PLAN:
echo    - Go to Plan Builder
echo    - Add exercises and save plan
echo    - ⚡ WATCH: Dashboard counter updates INSTANTLY
echo.
echo 2. 📊 VERIFY DASHBOARD:
echo    - Check "Workout Plans" counter
echo    - Should show new count immediately
echo    - Look for "REAL-TIME" indicators
echo.
echo 3. 🗑️ DELETE A PLAN:
echo    - Go to My Plans page
echo    - Delete any plan
echo    - ⚡ WATCH: Dashboard counter decreases INSTANTLY
echo.
echo 4. 🔄 TEST SYNC STATUS:
echo    - Look for sync indicators
echo    - Green = MongoDB synced
echo    - Yellow = Pending sync
echo.
echo ========================================
echo 🏆 EXPECTED RESULTS
echo ========================================
echo.
echo ✅ Plan creation updates dashboard INSTANTLY
echo ✅ Plan deletion updates dashboard INSTANTLY  
echo ✅ Real-time sync status indicators
echo ✅ MongoDB persistence across sessions
echo ✅ Professional gym-level experience
echo ✅ Cross-device data availability
echo.
echo 🔥 PROFESSIONAL GYM TRACKER - REAL-TIME READY!
echo.
pause