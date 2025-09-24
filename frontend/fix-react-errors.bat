@echo off
echo Fixing React Refresh Runtime Errors...

echo.
echo Step 1: Clearing node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo Step 2: Clearing Vite cache...
if exist .vite rmdir /s /q .vite
if exist dist rmdir /s /q dist

echo.
echo Step 3: Clearing browser cache directories...
if exist "%APPDATA%\npm-cache" rmdir /s /q "%APPDATA%\npm-cache"

echo.
echo Step 4: Installing dependencies...
npm install

echo.
echo Step 5: Starting development server...
npm run dev

echo.
echo React errors should now be fixed!
pause