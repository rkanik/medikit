import { Pressable, StatusBar, View } from 'react-native'

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
import { CloudDownloadIcon, CloudUploadIcon } from 'lucide-react-native'
import { useCallback, useState } from 'react'

export default function Screen() {
	const { user, isLoading, error, login, logout, setError } = useAuth()

	const [uploading, setUploading] = useState(false)

	const onUploadPatients = useCallback(async () => {
		const base = fs.getDirectory().uri
		const patients: TPatient[] = JSON.parse(storage.getString('patients')!)
		const patientsJSON = patients.map(v => {
			return {
				...v,
				avatar: v.avatar?.uri
					? {
							...v.avatar,
							uri: v.avatar.uri.replace(base, ''),
					  }
					: undefined,
			}
		})
		const patientsFile = fs.createJsonFile(patientsJSON, 'patients.json')
		setUploading(true)
		api.drive
			.uploadFiles([patientsFile])
			.then(r => {
				console.log('response', r)
			})
			.catch(e => {
				console.log('error', e)
			})
			.finally(() => {
				setUploading(false)
			})
	}, [])

	const onUploadRecords = useCallback(async () => {
		const base = fs.getDirectory().uri
		const records: TRecord[] = JSON.parse(storage.getString('records')!)
		const recordsJSON = records.map(v => {
			return {
				...v,
				attachments: v.attachments.map(attachment => {
					return {
						...attachment,
						uri: attachment.uri?.replace(base, ''),
					}
				}),
			}
		})
		const recordsFile = fs.createJsonFile(recordsJSON, 'records.json')
		setUploading(true)
		api.drive
			.uploadFiles([recordsFile])
			.then(r => {
				console.log('response', r)
			})
			.catch(e => {
				console.log('error', e)
			})
			.finally(() => {
				setUploading(false)
			})
	}, [])

	const onUpload = useCallback(async () => {
		// onUploadPatients()
		// onUploadRecords()
		// const avatars = fs.getFiles('avatars')
		// const attachments = fs.getFiles('attachments')
		// setUploading(true)
		// api.drive
		// 	.uploadFile([
		// 		...avatars.map(asset => ({
		// 			folder: 'avatars',
		// 			asset,
		// 		})),
		// 		...attachments.map(asset => ({
		// 			folder: 'attachments',
		// 			asset,
		// 		})),
		// 	])
		// 	.then(r => {
		// 		console.log('response', r)
		// 	})
		// 	.catch(e => {
		// 		console.log('error', e)
		// 	})
		// 	.finally(() => {
		// 		setUploading(false)
		// 	})
	}, [])
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
