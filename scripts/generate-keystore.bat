@echo off
REM Script to generate a release keystore for Android APK signing
REM Run this once to create the keystore, then reuse it for all builds

set KEYSTORE_NAME=medikit-release.keystore
set KEY_ALIAS=medikit-key

if exist "%KEYSTORE_NAME%" (
    echo Keystore already exists: %KEYSTORE_NAME%
    echo Delete it first if you want to generate a new one.
    exit /b 1
)

echo Generating release keystore for MediKit...
echo.
echo You will be prompted to enter:
echo   - A password for the keystore (store password)
echo   - A password for the key (key password)
echo   - Your name and organization details
echo.
echo IMPORTANT: Save these passwords securely!
echo    You'll need them every time you build an APK.
echo.

keytool -genkeypair -v -storetype PKCS12 -keystore "%KEYSTORE_NAME%" -alias "%KEY_ALIAS%" -keyalg RSA -keysize 2048 -validity 10000

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Keystore generated successfully: %KEYSTORE_NAME%
    echo.
    echo Next step: Run 'npm run build:apk:local' to build a signed APK
) else (
    echo.
    echo Failed to generate keystore
    exit /b 1
)

