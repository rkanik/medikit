# Build Scripts

Scripts for building signed Android APKs locally without EAS.

## Quick Start

### 1. Generate Keystore (One-time setup)

```bash
npm run generate-keystore
```

This creates `medikit-release.keystore` in the project root. **Save the passwords securely!**

### 2. Build Signed APK

```bash
npm run build:apk:local
```

The script will:
- Copy the keystore to the android directory
- Prompt for keystore passwords
- Temporarily patch `build.gradle` for signing
- Build the signed APK
- Restore `build.gradle` to its original state

The signed APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## How It Works

- **Keystore**: Stored in project root (`medikit-release.keystore`), gitignored
- **No permanent changes**: The `android/` directory is not permanently modified
- **Automatic cleanup**: `build.gradle` is automatically restored after building

## Security Notes

⚠️ **Important:**
- The keystore file is gitignored and should never be committed
- Back up your keystore file and passwords securely
- Losing your keystore means you cannot update your app on Google Play Store

