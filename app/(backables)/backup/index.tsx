import { Pressable, Alert as RNAlert, ScrollView, View } from 'react-native'

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
import { useBackgroundTask } from '@/services/background'
import { backup } from '@/services/backup'
import { restore } from '@/services/restore'
import { $df } from '@/utils/dayjs'
import { BackgroundTaskStatus } from 'expo-background-task'
import { Stack } from 'expo-router'
import { DownloadIcon, UploadIcon } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { useMMKVNumber } from 'react-native-mmkv'

export default function Screen() {
	//
	const { user, isLoading, error, login, logout, setError } = useAuth()

	const [isUploading, setUploading] = useState(false)
	const onUpload = useCallback(async () => {
		RNAlert.alert(
			'Upload to Google Drive',
			'Are you sure you want to upload your data to Google Drive? This will overwrite your backup data.',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Upload',
					onPress: async () => {
						setUploading(true)
						const response = await backup()
						console.log('onUpload', response)
						setUploading(false)
					},
				},
			],
		)
	}, [])

	const [isRestoring, setRestoring] = useState(false)
	const onRestore = useCallback(async () => {
		RNAlert.alert(
			'Restore from Google Drive',
			'Are you sure you want to restore your data from Google Drive? This will overwrite your current data.',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Restore',
					onPress: async () => {
						setRestoring(true)
						const response = await restore()
						console.log('onRestore', response)
						setRestoring(false)
					},
				},
			],
		)
	}, [])

	const { status, isRegistered, trigger, unregister, register, toggle } =
		useBackgroundTask()
	// const { data: tasks } = useMMKVArray<any>('tasks')

	const [lastBackupTime] = useMMKVNumber('lastBackupTime')

	return (
		<ScrollView
			contentContainerClassName="px-4 pb-8"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Stack.Screen options={{ title: 'Backup & Restore' }} />
			<View className="rounded-2xl border border-emerald-200 dark:border-emerald-900 p-4 gap-2 bg-emerald-50/80 dark:bg-emerald-900/30">
				<Text className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
					Google Drive Backup
				</Text>
				<Text className="text-sm text-emerald-900/80 dark:text-emerald-100/80">
					Keep your medical histories safe by syncing them to your own Drive. No
					external servers are involved — everything stays on your device until
					you tap &apos;Upload to Google Drive&apos;.
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
						<Text size="sm">
							This account will be used to backup and restore your data to
							Google Drive.
						</Text>
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
						<View className="flex-row">
							<Button
								variant="outline"
								disabled={isLoading}
								className="mt-3"
								onPress={logout}
							>
								{isLoading && <ButtonSpinner color="gray" />}
								<ButtonText>Disconnect</ButtonText>
							</Button>
						</View>
					</Card>
					<Card size="lg" variant="outline">
						<Heading size="md">Backup & Restore</Heading>
						<Text size="sm">Backup and restore your data to Google Drive.</Text>
						<Divider className="my-3" />
						<Text size="sm">
							Last backup:{' '}
							{lastBackupTime
								? $df(lastBackupTime, 'DD MMM, YYYY hh:mm A')
								: 'Never'}
						</Text>
						<View className="gap-2 mt-4">
							<Button size="2xl" disabled={isUploading} onPress={onUpload}>
								{isUploading && <ButtonSpinner color="gray" />}
								<ButtonIcon as={UploadIcon} size="lg" />
								<ButtonText>Upload to Google Drive</ButtonText>
							</Button>
							<Button size="2xl" disabled={isRestoring} onPress={onRestore}>
								{isRestoring && <ButtonSpinner color="gray" />}
								<ButtonIcon as={DownloadIcon} size="lg" />
								<ButtonText>Restore from Google Drive</ButtonText>
							</Button>
						</View>
					</Card>
				</View>
			) : (
				<Card size="lg" variant="outline" className="mt-3">
					<Heading size="md">Google Drive Backup</Heading>
					<Text size="sm">
						Connect your google account to backup and restore your data to
						Google Drive. Make sure to grant the necessary permissions to the
						app.
					</Text>
					<Divider className="my-3" />
					<HStack>
						<Button onPress={login} disabled={isLoading} className="mt-3">
							{isLoading && <ButtonSpinner color="gray" />}
							<ButtonText>Connect Google</ButtonText>
						</Button>
					</HStack>
				</Card>
			)}

			<Card size="lg" variant="outline" className="mt-3">
				<Heading size="md">Background Tasks</Heading>
				<Text size="sm">
					Background tasks are used to backup and restore your data to Google
					Drive.
				</Text>
				<View className="flex-row gap-2 mt-4">
					<Button size="xs" onPress={trigger}>
						<ButtonText>Trigger</ButtonText>
					</Button>
					<Button size="xs" onPress={register}>
						<ButtonText>Register</ButtonText>
					</Button>
					<Button size="xs" onPress={unregister}>
						<ButtonText>Unregister</ButtonText>
					</Button>
					<Button size="xs" onPress={toggle}>
						<ButtonText>Toggle</ButtonText>
					</Button>
				</View>
				<Divider className="my-3" />
				<View>
					<Text>
						Status:{' '}
						{status === BackgroundTaskStatus.Available
							? 'Available'
							: 'Restricted'}
					</Text>
					<Text>Registered: {isRegistered ? 'Yes' : 'No'}</Text>
				</View>
			</Card>
		</ScrollView>
	)
}
