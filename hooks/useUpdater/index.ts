import { appVersion } from '@/const'
import { useDownloader } from '@/hooks/useDownloader'
import { File, Paths } from 'expo-file-system'
import * as FileSystem from 'expo-file-system/legacy'
import * as IntentLauncher from 'expo-intent-launcher'
import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { useMMKVNumber } from 'react-native-mmkv'

const installApk = async (fileUri: string) => {
	console.log(`[Updater]: Installing APK from ${fileUri}`)
	try {
		if (Platform.OS === 'android') {
			// Convert file:// URI to content:// URI for Android 7.0+
			const contentUri = await FileSystem.getContentUriAsync(fileUri)

			console.log('contentUri', contentUri)

			// Android Intent flags:
			// FLAG_GRANT_READ_URI_PERMISSION = 0x00000001 (1) - grant read permission to receiving app
			// FLAG_ACTIVITY_NEW_TASK = 0x10000000 (268435456) - start activity in new task
			// Combined: 268435457
			const FLAG_GRANT_READ_URI_PERMISSION = 1
			const FLAG_ACTIVITY_NEW_TASK = 268435456
			const flags = FLAG_GRANT_READ_URI_PERMISSION | FLAG_ACTIVITY_NEW_TASK

			// Use expo-intent-launcher to install APK on Android
			const result = await IntentLauncher.startActivityAsync(
				'android.intent.action.VIEW',
				{
					data: contentUri,
					// type: 'application/vnd.android.package-archive',
					// flags,
				},
			)
			console.log('Installation result:', result)

			// ResultCode.Success = -1, ResultCode.Canceled = 0
			// Note: For APK installation, resultCode 0 often means the intent was launched
			// but the installation dialog was dismissed. The actual installation happens
			// asynchronously and may complete even if resultCode is 0.
			if (result.resultCode === IntentLauncher.ResultCode.Success) {
				console.log('[Updater]: Installation intent launched successfully')
			} else if (result.resultCode === IntentLauncher.ResultCode.Canceled) {
				console.log('[Updater]: Installation dialog was canceled or dismissed')
			}
		} else {
			console.log('[Updater]: APK installation is only supported on Android')
		}
	} catch (error: any) {
		console.log(`[Updater]: Error installing APK: ${error.message}`)
		throw error
	}
}

const versionToNumber = (version: string) => {
	return +version.replace(/^v/, '').replace(/-.*$/, '').split('.').join('')
}

const ONE_DAY = 1000 * 60 * 60 * 24

export const useUpdater = () => {
	const { data: downloads, download } = useDownloader()
	const [loading, setLoading] = useState(false)
	const [lastChecked, setLastChecked] = useMMKVNumber(`useUpdater:lastChecked`)

	const checkForUpdates = useCallback(async () => {
		setLoading(true)
		console.log(`[Updater]: Checking for updates...`)
		const response = await fetch(
			'https://api.github.com/repos/rkanik/medikit/releases/latest',
		).then(res => res.json())

		const apkUrl: string = response.assets.find((asset: any) =>
			asset.name.endsWith('.apk'),
		)?.browser_download_url

		if (!apkUrl) {
			console.log(`[Updater]: No APK found in release assets`)
			return setLoading(false)
		}

		const version = versionToNumber(response.tag_name)
		const currentVersion = versionToNumber(appVersion)

		//
		if (version >= currentVersion) {
			const apkName = apkUrl.split('/').pop()
			const destinationFile = new File(Paths.document, apkName!)

			const id = `${apkUrl}-${destinationFile.uri}`
			const existing = downloads.find(download => download.id === id)
			// console.log('existing', existing)

			if (destinationFile.exists && existing?.status === 'completed') {
				console.log('Apk already exists, skipping download')
				// prompt to update
				installApk(destinationFile.uri)
				return setLoading(false)
			}
			//
			console.log(`[Updater]: Have to download the apk`)
			await download(apkUrl, destinationFile.uri)
		} else {
			console.log(`[Updater]: No update available`)
		}
		setLoading(false)
	}, [downloads, download])

	useEffect(() => {
		// check for updates every 24 hours
		if (!lastChecked || Date.now() - lastChecked > ONE_DAY) {
			checkForUpdates().then(() => {
				setLastChecked(Date.now())
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loading,
		lastChecked,
		checkForUpdates,
	}
}
