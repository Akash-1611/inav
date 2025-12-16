@echo off
echo Fixing PlatformConstants error...
echo.

echo Step 1: Clearing Expo cache...
npx expo r -c

echo.
echo Step 2: Clearing npm cache...
npm cache clean --force

echo.
echo Step 3: Removing node_modules and package-lock.json...
rmdir /s /q node_modules
del package-lock.json

echo.
echo Step 4: Reinstalling dependencies...
npm install

echo.
echo Step 5: Installing expo-constants explicitly...
npx expo install expo-constants

echo.
echo Fix completed! Try running 'npm start' now.
pause