import { Pressable, ScrollView, View } from 'react-native'

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
import { useMMKVArray } from '@/hooks/useMMKVArray'
import { useBackgroundTask } from '@/services/background'
import { backup } from '@/services/backup'
import { restore } from '@/services/restore'
import { $df } from '@/utils/dayjs'
import { FlashList } from '@shopify/flash-list'
import { CloudDownloadIcon, CloudUploadIcon } from 'lucide-react-native'
import { useCallback, useState } from 'react'

export default function Screen() {
	//
	const [uploading, setUploading] = useState(false)
	const { user, isLoading, error, login, logout, setError } = useAuth()

	const onUpload = useCallback(async () => {
		setUploading(true)

		const response = await backup()
		console.log('onUpload', response)

		setUploading(false)
	}, [])

	const [isRestoring, setRestoring] = useState(false)
	const onRestore = useCallback(async () => {
		setRestoring(true)

		const response = await restore()
		console.log('onRestore', response)

		setRestoring(false)
	}, [])

	const onTest = useCallback(async () => {
		//
	}, [])

	const { status, isRegistered, trigger, unregister } = useBackgroundTask()
	const { data: tasks } = useMMKVArray<any>('tasks')

	return (
		<ScrollView
			contentContainerClassName="px-4"
			contentContainerStyle={{ flexGrow: 1 }}
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
								onPress={onRestore}
								disabled={isRestoring}
								className="mt-3"
							>
								{isRestoring && <ButtonSpinner color="gray" />}
								<ButtonIcon as={CloudDownloadIcon} size="lg" />
								<ButtonText>Restore from Google Drive</ButtonText>
							</Button>

							<Button onPress={onTest} className="mt-4">
								<ButtonText>Test</ButtonText>
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

			<Card size="lg" variant="outline" className="mt-3">
				<Heading size="md">Background Tasks</Heading>
				<Text size="sm">
					Background tasks are used to backup and restore your data to Google
					Drive.
				</Text>
				<Button onPress={trigger} className="mt-3">
					<ButtonText>Trigger</ButtonText>
				</Button>
				<Button onPress={unregister} className="mt-3">
					<ButtonText>Unregister</ButtonText>
				</Button>
				<Divider className="my-3" />
				<View>
					<Text>Status: {status}</Text>
					<Text>Is Registered: {isRegistered ? 'Yes' : 'No'}</Text>
				</View>
				<Text>Tasks: {tasks?.length}</Text>
				<FlashList
					data={tasks}
					scrollEnabled={false}
					keyExtractor={item => item.date}
					renderItem={({ item }) => (
						<View className="p-4 rounded-lg border border-neutral-200 dark:bg-neutral-900 mb-2">
							<Text>{$df(item.date, 'DD MMM, YYYY hh:mm:ssA')}</Text>
							<Text>Token: {item.token?.data ?? item.token?.error}</Text>
							{/* <BaseJson data={item} /> */}
						</View>
					)}
				/>
			</Card>
		</ScrollView>
	)
}
