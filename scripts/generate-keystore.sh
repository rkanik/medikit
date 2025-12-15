#!/bin/bash

# Script to generate a release keystore for Android APK signing
# Run this once to create the keystore, then reuse it for all builds

KEYSTORE_NAME="medikit-release.keystore"
KEY_ALIAS="medikit-key"

if [ -f "$KEYSTORE_NAME" ]; then
    echo "⚠️  Keystore already exists: $KEYSTORE_NAME"
    echo "Delete it first if you want to generate a new one."
    exit 1
fi

echo "Generating release keystore for MediKit..."
echo ""
echo "You will be prompted to enter:"
echo "  - A password for the keystore (store password)"
echo "  - A password for the key (key password)"
echo "  - Your name and organization details"
echo ""
echo "⚠️  IMPORTANT: Save these passwords securely!"
echo "   You'll need them every time you build an APK."
echo ""

keytool -genkeypair -v -storetype PKCS12 -keystore "$KEYSTORE_NAME" -alias "$KEY_ALIAS" -keyalg RSA -keysize 2048 -validity 10000

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Keystore generated successfully: $KEYSTORE_NAME"
    echo ""
    echo "Next step: Run 'npm run build:apk:local' to build a signed APK"
else
    echo ""
    echo "✗ Failed to generate keystore"
    exit 1
fi

