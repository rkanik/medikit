#!/usr/bin/env node

/**
 * Cross-platform build script for signed Android APK
 * Handles keystore setup and APK building without permanently modifying android/ directory
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const readline = require('readline')

const KEYSTORE_NAME = 'medikit-release.keystore'
const KEY_ALIAS = 'medikit-key'
const ANDROID_DIR = 'android'
const BUILD_GRADLE = path.join(ANDROID_DIR, 'app', 'build.gradle')
const BUILD_GRADLE_BACKUP = BUILD_GRADLE + '.backup'

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

function question(query) {
	return new Promise(resolve => rl.question(query, resolve))
}

function questionHidden(query) {
	return new Promise((resolve, reject) => {
		const stdin = process.stdin
		stdin.setRawMode(true)
		stdin.resume()
		stdin.setEncoding('utf8')
		process.stdout.write(query)

		let password = ''
		stdin.on('data', function (char) {
			char = char + ''
			switch (char) {
				case '\n':
				case '\r':
				case '\u0004':
					stdin.setRawMode(false)
					stdin.pause()
					process.stdout.write('\n')
					resolve(password)
					break
				case '\u0003':
					stdin.setRawMode(false)
					stdin.pause()
					process.stdout.write('\n')
					process.exit()
					break
				case '\u007f':
					if (password.length > 0) {
						password = password.slice(0, -1)
						process.stdout.write('\b \b')
					}
					break
				default:
					password += char
					process.stdout.write('*')
					break
			}
		})
	})
}

async function main() {
	console.log('🔨 Building signed Android APK...\n')

	// Check if keystore exists
	if (!fs.existsSync(KEYSTORE_NAME)) {
		console.log(`❌ Keystore not found: ${KEYSTORE_NAME}\n`)
		console.log('Please generate a keystore first:')
		console.log('  npm run generate-keystore\n')
		process.exit(1)
	}

	// Ensure android directory exists
	if (!fs.existsSync(ANDROID_DIR)) {
		console.log('⚠️  Android directory not found. Running prebuild...\n')
		execSync('npm run prebuild', { stdio: 'inherit' })
	}

	// Check if build.gradle exists
	if (!fs.existsSync(BUILD_GRADLE)) {
		console.log(`❌ build.gradle not found. Run 'npm run prebuild' first.\n`)
		process.exit(1)
	}

	// Copy keystore to android directory
	console.log('📋 Copying keystore to android directory...')
	fs.copyFileSync(KEYSTORE_NAME, path.join(ANDROID_DIR, 'app', KEYSTORE_NAME))

	// Prompt for passwords
	console.log('\n📝 Enter keystore information:')
	const storePassword = await questionHidden('Keystore password: ')
	const keyPasswordInput = await questionHidden(
		'Key password (press Enter if same as keystore): ',
	)
	const keyPassword = keyPasswordInput || storePassword

	// Backup build.gradle
	console.log('\n📝 Backing up build.gradle...')
	fs.copyFileSync(BUILD_GRADLE, BUILD_GRADLE_BACKUP)

	// Patch build.gradle
	console.log('🔧 Temporarily patching build.gradle for signing...')
	try {
		execSync(
			`node scripts/patch-build-gradle.js "${BUILD_GRADLE}" "${storePassword}" "${keyPassword}" "${KEY_ALIAS}"`,
			{ stdio: 'inherit' },
		)
	} catch (error) {
		console.error('❌ Failed to patch build.gradle')
		// Restore backup
		if (fs.existsSync(BUILD_GRADLE_BACKUP)) {
			fs.copyFileSync(BUILD_GRADLE_BACKUP, BUILD_GRADLE)
		}
		process.exit(1)
	}

	// Build APK
	console.log('\n🏗️  Building release APK...')
	try {
		const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'
		execSync(`${gradlew} assembleRelease`, {
			cwd: ANDROID_DIR,
			stdio: 'inherit',
		})
	} catch (error) {
		console.error('\n❌ Build failed')
		// Restore backup
		if (fs.existsSync(BUILD_GRADLE_BACKUP)) {
			fs.copyFileSync(BUILD_GRADLE_BACKUP, BUILD_GRADLE)
			console.log('✓ build.gradle restored')
		}
		process.exit(1)
	}

	// Restore build.gradle
	console.log('\n🔄 Restoring build.gradle...')
	if (fs.existsSync(BUILD_GRADLE_BACKUP)) {
		fs.copyFileSync(BUILD_GRADLE_BACKUP, BUILD_GRADLE)
		fs.unlinkSync(BUILD_GRADLE_BACKUP)
		console.log('✓ build.gradle restored')
	}

	// Check if APK was built
	const apkPath = path.join(
		ANDROID_DIR,
		'app',
		'build',
		'outputs',
		'apk',
		'release',
		'app-release.apk',
	)
	if (fs.existsSync(apkPath)) {
		const stats = fs.statSync(apkPath)
		const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
		console.log('\n✅ APK built successfully!\n')
		console.log(`📦 APK location: ${apkPath}`)
		console.log(`📊 APK size: ${sizeMB} MB\n`)
	} else {
		console.log('\n❌ APK not found. Build may have failed.\n')
		process.exit(1)
	}

	rl.close()
}

main().catch(error => {
	console.error('Error:', error)
	// Restore backup on error
	if (fs.existsSync(BUILD_GRADLE_BACKUP)) {
		fs.copyFileSync(BUILD_GRADLE_BACKUP, BUILD_GRADLE)
		fs.unlinkSync(BUILD_GRADLE_BACKUP)
	}
	process.exit(1)
})

