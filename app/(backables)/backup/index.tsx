import { Platform, Pressable, StatusBar, View } from 'react-native'

import { api } from '@/api'
import { Alert, AlertText } from '@/components/ui/alert'
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import {
	Button,
	ButtonIcon,
	ButtonSpinner,
	ButtonText,
} from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Divider } from '@/components/ui/divider'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { CloseIcon, Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/context/AuthContext'
import { TPatient, TRecord } from '@/types/database'
import { fs } from '@/utils/fs'
import { storage } from '@/utils/storage'
import * as Notifications from 'expo-notifications'
import { CloudDownloadIcon, CloudUploadIcon } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'

// Configure notification handler
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: false,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
})

export default function Screen() {
	//
	const [uploading, setUploading] = useState(false)
	const { user, isLoading, error, login, logout, setError } = useAuth()
	const notificationIdRef = useRef<string | null>(null)

	// Set up notification channel for Android and request permissions
	useEffect(() => {
		const setupNotifications = async () => {
			if (Platform.OS === 'android') {
				await Notifications.setNotificationChannelAsync('backup-progress', {
					name: 'Backup Progress',
					importance: Notifications.AndroidImportance.LOW,
					vibrationPattern: [0, 250, 250, 250],
					lightColor: '#E6F4FE',
				})
			}

			const { status: existingStatus } =
				await Notifications.getPermissionsAsync()
			if (existingStatus !== 'granted') {
				await Notifications.requestPermissionsAsync()
			}
		}

		setupNotifications()
	}, [])

	const createJsonFiles = useCallback(() => {
		const base = fs.getDirectory().uri
		const records: TRecord[] = JSON.parse(storage.getString('records')!)
		const patients: TPatient[] = JSON.parse(storage.getString('patients')!)
		const recordsJSON = records.map(v => ({
			...v,
			attachments: v.attachments.map(attachment => {
				return {
					...attachment,
					uri: attachment.uri?.replace(base, ''),
				}
			}),
		}))
		const patientsJSON = patients.map(v => ({
			...v,
			avatar: v.avatar?.uri
				? {
						...v.avatar,
						uri: v.avatar.uri.replace(base, ''),
				  }
				: undefined,
		}))
		const recordsFile = fs.createJsonFile(recordsJSON, 'records.json')
		const patientsFile = fs.createJsonFile(patientsJSON, 'patients.json')
		return [recordsFile, patientsFile].map(v => ({ ...v, overwrite: true }))
	}, [])

	const onUpload = useCallback(async () => {
		setUploading(true)
		const avatars = fs.getFiles('avatars')
		const attachments = fs.getFiles('attachments')
		const jsonFiles = createJsonFiles()
		const totalFiles = jsonFiles.length + avatars.length + attachments.length

		// Show initial notification
		const notificationId = await Notifications.scheduleNotificationAsync({
			content: {
				title: 'Backup Started',
				body: `Uploading ${totalFiles} files to Google Drive...`,
			},
			trigger: null,
			...(Platform.OS === 'android' && {
				android: {
					channelId: 'backup-progress',
				},
			}),
		})
		notificationIdRef.current = notificationId

		api.drive.upload(
			[
				...jsonFiles,
				...avatars.map((v: any) => {
					v.folder = 'avatars'
					return v
				}),
				...attachments.map((v: any) => {
					v.folder = 'attachments'
					return v
				}),
			],
			{
				onProgress: async event => {
					console.log('onProgress', JSON.stringify(event, null, 2))
					const progress = Math.round(event.progress)
					const fileName = event.file.uri?.split('/').pop() || 'file'

					// Cancel previous notification and show updated progress
					if (notificationIdRef.current) {
						await Notifications.dismissNotificationAsync(
							notificationIdRef.current,
						)
					}
					const notificationId = await Notifications.scheduleNotificationAsync({
						content: {
							title: 'Backup in Progress',
							body: `${progress}% - ${event.index + 1}/${
								event.total
							} files (${fileName})`,
						},
						trigger: null,
						...(Platform.OS === 'android' && {
							android: {
								channelId: 'backup-progress',
							},
						}),
					})
					notificationIdRef.current = notificationId
				},
				onError: async event => {
					console.log('onError', event)
					if (notificationIdRef.current) {
						await Notifications.dismissNotificationAsync(
							notificationIdRef.current,
						)
					}
					await Notifications.scheduleNotificationAsync({
						content: {
							title: 'Backup Failed',
							body: `Error: ${event.errorCount} file(s) failed to upload`,
						},
						trigger: null,
						...(Platform.OS === 'android' && {
							android: {
								channelId: 'backup-progress',
							},
						}),
					})
					notificationIdRef.current = null
					setUploading(false)
				},
				onComplete: async event => {
					console.log('onComplete', event)
					if (notificationIdRef.current) {
						await Notifications.dismissNotificationAsync(
							notificationIdRef.current,
						)
					}
					await Notifications.scheduleNotificationAsync({
						content: {
							title: 'Backup Complete',
							body: `Successfully uploaded ${event.successCount} file(s)${
								event.errorCount > 0 ? ` (${event.errorCount} failed)` : ''
							}`,
						},
						trigger: null,
						...(Platform.OS === 'android' && {
							android: {
								channelId: 'backup-progress',
							},
						}),
					})
					notificationIdRef.current = null
					setUploading(false)
				},
			},
		)
	}, [createJsonFiles])
	return (
		<Box
			style={{ paddingTop: StatusBar.currentHeight }}
			className="flex-1 px-4 py-6 gap-4"
		>
			<View className="rounded-2xl border border-emerald-200 dark:border-emerald-900 p-4 gap-2 bg-emerald-50/80 dark:bg-emerald-900/30">
				<Text className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
					Google Drive backup
				</Text>
				<Text className="text-sm text-emerald-900/80 dark:text-emerald-100/80">
					Keep your medical histories safe by syncing them to your own Drive. No
					external servers are involved — everything stays on your device until
					you tap Backup.
				</Text>
			</View>
			{error && (
				<Alert action="error" className="gap-3 mt-3">
					<AlertText className="text-typography-900" size="sm">
						<Text className="mr-2 font-semibold text-typography-900">
							Error:
						</Text>
						{error}
					</AlertText>
					<Pressable className="ml-auto" onPress={() => setError(null)}>
						<Icon as={CloseIcon} size="lg" />
					</Pressable>
				</Alert>
			)}
			{user ? (
				<View className="mt-4 gap-4">
					<Card size="lg" variant="outline">
						<Heading size="md">Google Account</Heading>
						<Text size="sm">Backup and restore your data to Google Drive.</Text>
						<Divider className="my-3" />
						<HStack space="lg" className="items-center">
							<Avatar size="lg">
								<AvatarFallbackText>
									{user.name?.charAt(0) || user.email.split('@')[0].charAt(0)}
								</AvatarFallbackText>
								<AvatarImage source={{ uri: user.photo ?? '' }} />
							</Avatar>
							<Box>
								<Heading size="sm">
									{user.name || user.email.split('@')[0]}
								</Heading>
								<Text size="sm">{user.email}</Text>
							</Box>
						</HStack>
						<HStack>
							<Button
								variant="outline"
								onPress={logout}
								disabled={isLoading}
								className="mt-3"
							>
								{isLoading && <ButtonSpinner color="gray" />}
								<ButtonText>Disconnect</ButtonText>
							</Button>
						</HStack>
					</Card>
					<Card size="lg" variant="outline">
						<Heading size="md">Backup</Heading>
						<Text size="sm">Backup and restore your data to Google Drive.</Text>
						<Divider className="my-3" />
						<View>
							<Button
								variant="outline"
								onPress={onUpload}
								disabled={uploading}
								className="mt-3"
							>
								{uploading && <ButtonSpinner color="gray" />}
								<ButtonIcon as={CloudUploadIcon} size="lg" />
								<ButtonText>Upload to Google Drive</ButtonText>
							</Button>
							<Button
								variant="outline"
								onPress={logout}
								disabled={isLoading}
								className="mt-3"
							>
								{isLoading && <ButtonSpinner color="gray" />}
								<ButtonIcon as={CloudDownloadIcon} size="lg" />
								<ButtonText>Restore from Google Drive</ButtonText>
							</Button>
						</View>
					</Card>
				</View>
			) : (
				<Card size="lg" variant="outline" className="mt-3">
					<Heading size="md">Google Drive Backup</Heading>
					<Text size="sm">
						Connect your Google account to backup and restore your data to
						Google Drive.
					</Text>
					<Divider className="my-3" />
					<HStack>
						<Button
							variant="outline"
							onPress={login}
							disabled={isLoading}
							className="mt-3"
						>
							{isLoading && <ButtonSpinner color="gray" />}
							<ButtonText>Connect Google</ButtonText>
						</Button>
					</HStack>
				</Card>
			)}
		</Box>
	)
}
