@echo off
echo Fixing Analytics page issues...

echo.
echo 1. Stopping development server...
taskkill /f /im node.exe 2>nul

echo.
echo 2. Clearing browser cache files...
cd frontend
del /q .vite\* 2>nul
rmdir /s /q .vite 2>nul
del /q dist\* 2>nul
rmdir /s /q dist 2>nul

echo.
echo 3. Starting fresh development server...
npm run dev

echo.
echo Analytics page should now work without XP Points errors!
pause