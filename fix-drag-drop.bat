@echo off
echo Fixing React Beautiful DnD Error...

echo.
echo Choose your solution:
echo 1. Downgrade to React 18 (Recommended)
echo 2. Use HTML5 Drag & Drop (React 19 Compatible)
echo 3. Remove drag & drop temporarily
echo.

set /p choice="Enter your choice (1-3): "

cd frontend

if "%choice%"=="1" (
    echo.
    echo Installing React 18...
    call npm install react@^18.2.0 react-dom@^18.2.0
    call npm install @types/react@^18.2.0 @types/react-dom@^18.2.0 --save-dev
    echo.
    echo React 18 installed. Restarting development server...
    call npm run dev
) else if "%choice%"=="2" (
    echo.
    echo Switching to HTML5 Drag & Drop...
    copy "src\pages\PlansBuilder.jsx" "src\pages\PlansBuilder-backup.jsx"
    copy "src\pages\PlansBuilder-HTML5.jsx" "src\pages\PlansBuilder.jsx"
    echo.
    echo HTML5 version activated. Restarting development server...
    call npm run dev
) else if "%choice%"=="3" (
    echo.
    echo Creating simple version without drag & drop...
    echo // Simple Plans Builder without drag & drop > "src\pages\PlansBuilder-simple.jsx"
    echo export default function PlansBuilder() { >> "src\pages\PlansBuilder-simple.jsx"
    echo   return ^<div^>^<h2^>Plans Builder - Drag & Drop Temporarily Disabled^</h2^>^</div^>; >> "src\pages\PlansBuilder-simple.jsx"
    echo } >> "src\pages\PlansBuilder-simple.jsx"
    copy "src\pages\PlansBuilder-simple.jsx" "src\pages\PlansBuilder.jsx"
    echo.
    echo Drag & drop disabled. Restarting development server...
    call npm run dev
) else (
    echo Invalid choice. Please run the script again.
)

echo.
echo Fix applied! Check your browser for results.
pause