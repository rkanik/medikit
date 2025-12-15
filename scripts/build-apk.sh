#!/bin/bash

# Build script for signed Android APK
# This script handles keystore setup and APK building without permanently modifying android/ directory

set -e

KEYSTORE_NAME="medikit-release.keystore"
KEY_ALIAS="medikit-key"
ANDROID_DIR="android"
BUILD_GRADLE="$ANDROID_DIR/app/build.gradle"
BUILD_GRADLE_BACKUP="$BUILD_GRADLE.backup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
    if [ -f "$BUILD_GRADLE_BACKUP" ]; then
        echo ""
        echo "🔄 Restoring build.gradle..."
        mv "$BUILD_GRADLE_BACKUP" "$BUILD_GRADLE"
    fi
}
trap cleanup EXIT

echo "🔨 Building signed Android APK..."

# Check if keystore exists in root
if [ ! -f "$KEYSTORE_NAME" ]; then
    echo ""
    echo -e "${RED}✗ Keystore not found: $KEYSTORE_NAME${NC}"
    echo ""
    echo "Please generate a keystore first:"
    echo "  npm run generate-keystore"
    echo ""
    echo "Or manually run:"
    echo "  scripts/generate-keystore.sh"
    exit 1
fi

# Ensure android directory exists
if [ ! -d "$ANDROID_DIR" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Android directory not found. Running prebuild...${NC}"
    npm run prebuild
fi

# Check if build.gradle exists
if [ ! -f "$BUILD_GRADLE" ]; then
    echo -e "${RED}✗ build.gradle not found. Run 'npm run prebuild' first.${NC}"
    exit 1
fi

# Copy keystore to android directory
echo "📋 Copying keystore to android directory..."
cp "$KEYSTORE_NAME" "$ANDROID_DIR/app/$KEYSTORE_NAME"

# Prompt for keystore passwords
echo ""
echo -e "${YELLOW}Enter keystore information:${NC}"
read -sp "Keystore password: " STORE_PASSWORD
echo ""
read -sp "Key password (press Enter if same as keystore): " KEY_PASSWORD
echo ""

# Use store password if key password is empty
if [ -z "$KEY_PASSWORD" ]; then
    KEY_PASSWORD="$STORE_PASSWORD"
fi

# Backup build.gradle
echo "📝 Backing up build.gradle..."
cp "$BUILD_GRADLE" "$BUILD_GRADLE_BACKUP"

# Patch build.gradle to add release signing config
echo "🔧 Temporarily patching build.gradle for signing..."
node scripts/patch-build-gradle.js "$BUILD_GRADLE" "$STORE_PASSWORD" "$KEY_PASSWORD" "$KEY_ALIAS"

# Build APK
echo ""
echo "🏗️  Building release APK..."
cd "$ANDROID_DIR"
./gradlew assembleRelease
cd ..

# Check if APK was built successfully
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo ""
    echo -e "${GREEN}✓ APK built successfully!${NC}"
    echo ""
    echo "📦 APK location: $APK_PATH"
    echo "📊 APK size: $APK_SIZE"
    echo ""
else
    echo ""
    echo -e "${RED}✗ APK not found. Build may have failed.${NC}"
    exit 1
fi

