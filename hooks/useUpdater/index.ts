import { appVersion } from '@/const'
import { useDownloader } from '@/hooks/useDownloader'
import { File, Paths } from 'expo-file-system'
import * as FileSystem from 'expo-file-system/legacy'
import * as IntentLauncher from 'expo-intent-launcher'
import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { useMMKVNumber } from 'react-native-mmkv'

const installApk = async (fileUri: string) => {
	if (Platform.OS === 'android') {
		const contentUri = await FileSystem.getContentUriAsync(fileUri)
		await IntentLauncher.startActivityAsync(
			'android.intent.action.INSTALL_PACKAGE',
			{
				data: contentUri,
				flags: (1 << 0) | (1 << 1),
				type: 'application/vnd.android.package-archive',
				extra: {
					'android.intent.extra.NOT_UNKNOWN_SOURCE': true,
				},
			},
		)
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

	const checkForUpdates = useCallback(
		async (options: { redownload?: boolean } = {}) => {
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

				if (
					destinationFile.exists &&
					existing?.status === 'completed' &&
					!options.redownload
				) {
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
		},
		[downloads, download],
	)

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
