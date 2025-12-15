#!/usr/bin/env node

/**
 * Script to temporarily patch build.gradle for signing configuration
 * This is used by build-apk scripts to add signing without permanently modifying android/ directory
 */

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const buildGradlePath = args[0]
const keystorePassword = args[1]
const keyPassword = args[2]
const keyAlias = args[3] || 'medikit-key'

if (!buildGradlePath || !keystorePassword || !keyPassword) {
	console.error(
		'Usage: patch-build-gradle.js <build.gradle path> <keystore password> <key password> [key alias]',
	)
	process.exit(1)
}

try {
	let content = fs.readFileSync(buildGradlePath, 'utf8')

	// Escape single quotes in passwords
	const escapePassword = pwd => pwd.replace(/'/g, "\\'").replace(/\$/g, '\\$')
	const safeStorePassword = escapePassword(keystorePassword)
	const safeKeyPassword = escapePassword(keyPassword)

	// Add release signing config after debug config in signingConfigs block
	const releaseSigningConfig = `        release {
            storeFile file('medikit-release.keystore')
            storePassword '${safeStorePassword}'
            keyAlias '${keyAlias}'
            keyPassword '${safeKeyPassword}'
        }`

	// Find signingConfigs block and add release config after debug (before closing brace)
	// Match: signingConfigs { ... debug { ... } ... }
	content = content.replace(
		/(signingConfigs \{[^}]*?debug \{[^}]+\}\s*)(\})/s,
		`$1${releaseSigningConfig}\n        $2`,
	)

	// Replace release signingConfig to use release instead of debug
	// Match: release { ... signingConfig signingConfigs.debug ... }
	content = content.replace(
		/(release \{[^}]*?)signingConfig signingConfigs\.debug/s,
		'$1signingConfig signingConfigs.release',
	)

	fs.writeFileSync(buildGradlePath, content, 'utf8')
	console.log('✓ build.gradle patched successfully')
} catch (error) {
	console.error('✗ Failed to patch build.gradle:', error.message)
	process.exit(1)
}

