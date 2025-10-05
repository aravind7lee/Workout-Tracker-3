@echo off
echo ========================================
echo ACHIEVEMENTS REMOVAL VERIFICATION
echo ========================================
echo.

echo Checking for remaining achievement references...
echo.

echo [1/6] Searching for "achievement" in frontend...
findstr /s /i "achievement" frontend\src\*.* 2>nul
if %errorlevel% equ 0 (
    echo ❌ Found achievement references!
) else (
    echo ✅ No achievement references found
)
echo.

echo [2/6] Searching for "XP" in frontend...
findstr /s /i "XP" frontend\src\*.* 2>nul
if %errorlevel% equ 0 (
    echo ❌ Found XP references!
) else (
    echo ✅ No XP references found
)
echo.

echo [3/6] Searching for "unlockedCount" in frontend...
findstr /s /i "unlockedCount" frontend\src\*.* 2>nul
if %errorlevel% equ 0 (
    echo ❌ Found unlockedCount references!
) else (
    echo ✅ No unlockedCount references found
)
echo.

echo [4/6] Searching for "checkAchievements" in frontend...
findstr /s /i "checkAchievements" frontend\src\*.* 2>nul
if %errorlevel% equ 0 (
    echo ❌ Found checkAchievements references!
) else (
    echo ✅ No checkAchievements references found
)
echo.

echo [5/6] Searching for "/achievements" routes...
findstr /s /i "/achievements" frontend\src\*.* 2>nul
if %errorlevel% equ 0 (
    echo ❌ Found /achievements route references!
) else (
    echo ✅ No /achievements route references found
)
echo.

echo [6/6] Checking backend for achievement routes...
findstr /s /i "achievement" backend\*.* 2>nul
if %errorlevel% equ 0 (
    echo ❌ Found achievement references in backend!
) else (
    echo ✅ No achievement references found in backend
)
echo.

echo ========================================
echo VERIFICATION COMPLETE
echo ========================================
echo.
echo If all checks show ✅, the achievements system has been completely removed.
echo You can now start the application without achievement-related errors.
echo.
pause