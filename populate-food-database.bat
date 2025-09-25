@echo off
echo ========================================
echo   POPULATING COMPREHENSIVE FOOD DATABASE
echo ========================================
echo.

cd backend
echo Starting food database population...
echo.

node scripts/populateFoodDatabase.js

echo.
echo ========================================
echo   FOOD DATABASE POPULATION COMPLETE
echo ========================================
pause