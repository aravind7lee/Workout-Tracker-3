@echo off
echo Testing Basic React Setup...

cd frontend

echo.
echo Step 1: Backing up current main.jsx...
if exist src\main.jsx (
    copy src\main.jsx src\main-backup.jsx
)

echo.
echo Step 2: Using minimal React setup...
copy src\main-minimal.jsx src\main.jsx

echo.
echo Step 3: Starting test server...
echo If React loads without errors, the basic setup is working!
echo Press Ctrl+C to stop the test and restore your original files.
echo.

npm run dev

echo.
echo Step 4: Restoring original main.jsx...
if exist src\main-backup.jsx (
    copy src\main-backup.jsx src\main.jsx
    del src\main-backup.jsx
)

pause