# Medikit

Medikit keeps your medical histories, prescriptions, and receipts entirely on-device with an option to back everything up to your own Google Drive. There is no backend server or shared database — you remain in full control of your data.

## Features

- Capture medical visits with doctor/clinic info, notes, amounts, and image attachments.
- All records are stored locally using MMKV for speed and privacy.
- One-tap Google Drive backup that zips your JSON + attachments and uploads them to a private `Medikit Backups` folder in your Drive.
- Restore on a new device by signing into Google Drive and downloading the latest archive.

## Local development

```bash
npm install
npx expo start
```

The project uses Expo Router. Tabs:

- **Home** – placeholder.
- **Records** – manage medical histories and attach prescriptions/receipts.
- **Backup** – connect to Google Drive, run backups, and restore.

## Google Drive setup

1. Create a Google Cloud project and enable the **Google Drive API**.
2. Configure OAuth consent (Internal or External) and publish it if needed.
3. Create the following OAuth client IDs (all under the same project):
   - Android
   - iOS
   - Web
   - Expo (type `Android` and use `host.exp.exponent` as the package name, `rN9T6u5bR3Zq2C3wXo5JavYzq0Y=` as the SHA-1 for Expo Go, or create a dedicated dev client)
4. Add the IDs to your environment as **public** Expo vars (values shown here are placeholders):

```bash
export EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID="1234-your-android-id.apps.googleusercontent.com"
export EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID="1234-your-ios-id.apps.googleusercontent.com"
export EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="1234-your-web-id.apps.googleusercontent.com"
export EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID="1234-your-expo-go-id.apps.googleusercontent.com"
```

5. Restart `npx expo start` so the env vars are injected.

The backup screen will now let you connect to Google Drive. Tokens are stored only on-device and expire automatically; simply reconnect if prompted.

## Testing backup & restore

1. Add a couple of records in the **Records** tab and attach some gallery images.
2. Go to **Backup**, connect Google, and tap **Backup now**.
3. Clean local data (`Delete app` or `npm start --clear` & `Reset cache`), then re-open the app.
4. Reconnect Google Drive and tap **Restore latest backup** — your histories and attachments should reappear.

## Scripts

- `npm run android` — build & run on Android
- `npm run ios` — build & run on iOS
- `npm run web` — run Expo for web
- `npm run lint` — run ESLint
