@echo off
echo ========================================
echo FIXING REACT REFRESH RUNTIME ERRORS
echo ========================================

cd frontend

echo.
echo Step 1: Stopping any running development servers...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Clearing all cache and build files...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)
if exist .vite (
    echo Removing .vite cache...
    rmdir /s /q .vite
)
if exist dist (
    echo Removing dist folder...
    rmdir /s /q dist
)

echo.
echo Step 3: Clearing npm cache...
npm cache clean --force

echo.
echo Step 4: Installing fresh dependencies...
npm install

echo.
echo Step 5: Verifying React plugin installation...
npm list @vitejs/plugin-react

echo.
echo Step 6: Starting development server with clean environment...
echo ========================================
echo Your React app should now load without errors!
echo ========================================
echo.

npm run dev

pause