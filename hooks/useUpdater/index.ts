import { appVersion } from '@/const'
import { useDownloader } from '@/hooks/useDownloader'
import { log } from '@/utils/logs'
import { open } from '@/utils/open'
import { File, Paths } from 'expo-file-system'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useMMKVNumber } from 'react-native-mmkv'

const versionToNumber = (version: string) => {
	return +version.replace(/^v/, '').replace(/-.*$/, '').split('.').join('')
}

const ONE_DAY = 1000 * 60 * 60 * 24

export const useUpdater = () => {
	const { data: downloads, download } = useDownloader()
	const [loading, setLoading] = useState(false)
	const [lastChecked, setLastChecked] = useMMKVNumber(`useUpdater:lastChecked`)

	const promptToUpdate = useCallback((url: string) => {
		Alert.alert(
			'Update Available',
			'A new version of the app is available. Please update to the latest version.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Update',
					onPress: () => {
						open(url)
					},
				},
			],
		)
	}, [])

	const checkForUpdates = useCallback(async () => {
		setLoading(true)
		log(`[Updater]: Checking for updates...`)
		const response = await fetch(
			'https://api.github.com/repos/rkanik/medikit/releases/latest',
		).then(res => res.json())

		const apkUrl: string = response.assets.find((asset: any) =>
			asset.name.endsWith('.apk'),
		)?.browser_download_url

		if (!apkUrl) {
			log(`[Updater]: No APK found in release assets`)
			return setLoading(false)
		}

		const version = versionToNumber(response.tag_name)
		const currentVersion = versionToNumber(appVersion)

		//
		if (version > currentVersion) {
			const apkName = apkUrl.split('/').pop()
			const destinationFile = new File(Paths.document, apkName!)

			const id = `${apkUrl}-${destinationFile.uri}`
			const existing = downloads.find(download => download.id === id)

			if (destinationFile.exists && existing?.status === 'completed') {
				promptToUpdate(destinationFile.uri)
				return setLoading(false)
			}
			//
			log(`[Updater]: Have to download the apk`)
			await download(apkUrl, destinationFile.uri)
			promptToUpdate(destinationFile.uri)
		} else {
			log(`[Updater]: No update available`)
		}
		setLoading(false)
	}, [downloads, download, promptToUpdate])

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
