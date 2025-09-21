@echo off
echo 🧹 Cleaning up deprecated packages...

echo Removing node_modules...
rmdir /s /q node_modules 2>nul

echo Removing package-lock.json...
del package-lock.json 2>nul

echo 📦 Installing updated packages...
npm install

echo ✅ Dependencies updated successfully!
echo 🚀 You can now run: npm run build
pause