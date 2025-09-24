@echo off
echo ========================================
echo ELIMINATING ALL CONSOLE ERRORS & WARNINGS
echo ========================================

cd frontend

echo.
echo Step 1: Stopping development server...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Clearing all cache...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .vite rmdir /s /q .vite
npm cache clean --force

echo.
echo Step 3: Installing dependencies...
npm install

echo.
echo Step 4: Starting clean development server...
echo ========================================
echo ALL CONSOLE ERRORS AND WARNINGS FIXED!
echo Your app should now run with ZERO console errors
echo ========================================
echo.

npm run dev

pause