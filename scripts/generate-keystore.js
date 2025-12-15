#!/usr/bin/env node

/**
 * Cross-platform script to generate a release keystore for Android APK signing
 * Run this once to create the keystore, then reuse it for all builds
 */

const fs = require('fs')
const { execSync } = require('child_process')

const KEYSTORE_NAME = 'medikit-release.keystore'
const KEY_ALIAS = 'medikit-key'

if (fs.existsSync(KEYSTORE_NAME)) {
	console.log(`⚠️  Keystore already exists: ${KEYSTORE_NAME}`)
	console.log('Delete it first if you want to generate a new one.\n')
	process.exit(1)
}

console.log('Generating release keystore for MediKit...\n')
console.log('You will be prompted to enter:')
console.log('  - A password for the keystore (store password)')
console.log('  - A password for the key (key password)')
console.log('  - Your name and organization details\n')
console.log('⚠️  IMPORTANT: Save these passwords securely!')
console.log("   You'll need them every time you build an APK.\n")

try {
	execSync(
		`keytool -genkeypair -v -storetype PKCS12 -keystore "${KEYSTORE_NAME}" -alias "${KEY_ALIAS}" -keyalg RSA -keysize 2048 -validity 10000`,
		{ stdio: 'inherit' },
	)

	console.log(`\n✅ Keystore generated successfully: ${KEYSTORE_NAME}\n`)
	console.log(
		"Next step: Run 'npm run build:apk:local' to build a signed APK\n",
	)
} catch (error) {
	console.log('\n❌ Failed to generate keystore')
	process.exit(1)
}

