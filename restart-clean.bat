@echo off
echo Restarting with clean Analytics page...

echo Stopping all Node processes...
taskkill /f /im node.exe 2>nul

echo Clearing Vite cache...
cd frontend
rmdir /s /q .vite 2>nul
rmdir /s /q dist 2>nul
rmdir /s /q node_modules\.vite 2>nul

echo Starting development server...
npm run dev