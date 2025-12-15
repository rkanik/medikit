@echo off
REM Build script for signed Android APK
REM This script handles keystore setup and APK building without permanently modifying android/ directory

setlocal enabledelayedexpansion

set KEYSTORE_NAME=medikit-release.keystore
set KEY_ALIAS=medikit-key
set ANDROID_DIR=android
set BUILD_GRADLE=%ANDROID_DIR%\app\build.gradle
set BUILD_GRADLE_BACKUP=%BUILD_GRADLE%.backup

echo Building signed Android APK...

REM Check if keystore exists in root
if not exist "%KEYSTORE_NAME%" (
    echo.
    echo Keystore not found: %KEYSTORE_NAME%
    echo.
    echo Please generate a keystore first:
    echo   npm run generate-keystore
    echo.
    echo Or manually run:
    echo   scripts\generate-keystore.bat
    exit /b 1
)

REM Ensure android directory exists
if not exist "%ANDROID_DIR%" (
    echo.
    echo Android directory not found. Running prebuild...
    call npm run prebuild
)

REM Check if build.gradle exists
if not exist "%BUILD_GRADLE%" (
    echo build.gradle not found. Run 'npm run prebuild' first.
    exit /b 1
)

REM Copy keystore to android directory
echo Copying keystore to android directory...
copy "%KEYSTORE_NAME%" "%ANDROID_DIR%\app\%KEYSTORE_NAME%" >nul

REM Prompt for keystore passwords
echo.
set /p STORE_PASSWORD="Enter keystore password: "
set /p KEY_PASSWORD="Enter key password (press Enter if same as keystore): "

REM Use store password if key password is empty
if "!KEY_PASSWORD!"=="" set KEY_PASSWORD=!STORE_PASSWORD!

REM Backup build.gradle
echo Backing up build.gradle...
copy "%BUILD_GRADLE%" "%BUILD_GRADLE_BACKUP%" >nul

REM Patch build.gradle - add release signing config after debug config
echo Temporarily patching build.gradle for signing...

REM Create a PowerShell script to patch the file
echo $content = Get-Content '%BUILD_GRADLE%' -Raw > %TEMP%\patch-build.ps1
echo $releaseConfig = "        release {`n            storeFile file('medikit-release.keystore')`n            storePassword '!STORE_PASSWORD!'`n            keyAlias '!KEY_ALIAS!'`n            keyPassword '!KEY_PASSWORD!'`n        }" >> %TEMP%\patch-build.ps1
echo $content = $content -replace '(signingConfigs \{[^}]+debug \{[^}]+\})', "`$1`n$releaseConfig" >> %TEMP%\patch-build.ps1
echo $content = $content -replace 'signingConfig signingConfigs\.debug', 'signingConfig signingConfigs.release' >> %TEMP%\patch-build.ps1
echo Set-Content '%BUILD_GRADLE%' -Value $content >> %TEMP%\patch-build.ps1

REM Use a simpler approach: use Node.js or Python if available, otherwise manual sed-like replacement
REM For Windows, we'll use a simpler approach with findstr and manual replacement
REM Actually, let's use a Node.js script for cross-platform compatibility

REM Patch build.gradle
echo Temporarily patching build.gradle for signing...
node scripts\patch-build-gradle.js "%BUILD_GRADLE%" "%STORE_PASSWORD%" "%KEY_PASSWORD%" "%KEY_ALIAS%"
if errorlevel 1 (
    echo Failed to patch build.gradle
    exit /b 1
)

REM Build APK
echo.
echo Building release APK...
cd %ANDROID_DIR%

if exist gradlew.bat (
    call gradlew.bat assembleRelease
) else (
    call gradlew assembleRelease
)

cd ..

REM Restore build.gradle
echo Restoring build.gradle...
if exist "%BUILD_GRADLE_BACKUP%" (
    move /Y "%BUILD_GRADLE_BACKUP%" "%BUILD_GRADLE%" >nul
    echo build.gradle restored
)

REM Check if APK was built successfully
set APK_PATH=%ANDROID_DIR%\app\build\outputs\apk\release\app-release.apk
if exist "%APK_PATH%" (
    echo.
    echo APK built successfully!
    echo.
    echo APK location: %APK_PATH%
    echo.
) else (
    echo.
    echo APK not found. Build may have failed.
    exit /b 1
)

