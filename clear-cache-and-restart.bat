@echo off
echo Clearing browser cache and restarting development server...

echo.
echo 1. Stopping any running development servers...
taskkill /f /im node.exe 2>nul

echo.
echo 2. Clearing npm cache...
cd frontend
npm cache clean --force

echo.
echo 3. Removing node_modules and package-lock.json...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo.
echo 4. Reinstalling dependencies...
npm install

echo.
echo 5. Starting development server...
npm run dev

pause