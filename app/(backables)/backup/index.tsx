import { Pressable, Alert as RNAlert, ScrollView, View } from 'react-native'

import { BaseCard } from '@/components/base/card'
import { BaseModal } from '@/components/base/modal'
import { FlashList } from '@/components/FlashList'
import { Alert } from '@/components/ui/alert'
import { Avatar } from '@/components/ui/avatar'
import {
	Button,
	ButtonIcon,
	ButtonSpinner,
	ButtonText,
} from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/context/AuthContext'
import { minimumIntervals, useBackgroundTask } from '@/services/background'
import { backup, useBackup } from '@/services/backup'
import { restore } from '@/services/restore'
import { $df } from '@/utils/dayjs'
import { Stack } from 'expo-router'
import { useCallback, useState } from 'react'
import { cn } from 'tailwind-variants'

export default function Screen() {
	//
	const { user, isLoading, error, login, logout, setError } = useAuth()

	const [isUploading, setUploading] = useState(false)
	const onBackup = useCallback(async () => {
		RNAlert.alert(
			'Backup to Google Drive',
			'Are you sure you want to backup your data to Google Drive? This will overwrite your existing backup data.',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Backup',
					onPress() {
						setUploading(true)
						backup().finally(() => {
							setUploading(false)
						})
					},
				},
			],
		)
	}, [])

	const [isRestoring, setRestoring] = useState(false)
	const onRestore = useCallback(async () => {
		RNAlert.alert(
			'Restore from Google Drive',
			'Are you sure you want to restore your data from Google Drive? This will overwrite your existing data.',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Restore',
					onPress() {
						setRestoring(true)
						restore().finally(() => {
							setRestoring(false)
						})
					},
				},
			],
		)
	}, [])

	const { lastBackupTime, lastBackupSize } = useBackup()
	const { minimumInterval, setMinimumInterval } = useBackgroundTask()
	const [minimumIntervalDialog, setMinimumIntervalDialog] = useState(false)

	return (
		<ScrollView
			contentContainerClassName="px-4 pb-8"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Stack.Screen options={{ title: 'Backup & Restore' }} />
			<BaseCard className="gap-2">
				<Text className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
					Google Drive Backup
				</Text>
				<Text className="text-sm text-emerald-900/80 dark:text-emerald-100/80">
					Keep your medical histories safe by syncing them to your own Drive. No
					external servers are involved — everything stays on your device until
					you tap &apos;Upload to Google Drive&apos;.
				</Text>
			</BaseCard>
			{error && (
				<Alert action="error" className="gap-3 mt-3">
					<Text className="text-typography-900" size="sm">
						<Text className="mr-2 font-semibold text-typography-900">
							Error:
						</Text>
						{error}
					</Text>
					<Pressable className="ml-auto" onPress={() => setError(null)}>
						<Icon name="close" />
					</Pressable>
				</Alert>
			)}
			{user ? (
				<View className="mt-4 gap-4">
					<BaseCard>
						<Text size="md">Google Account</Text>
						<Text size="sm">
							This account will be used to backup and restore your data to
							Google Drive.
						</Text>
						<Divider className="my-3" />
						<View className="items-center gap-2">
							<Avatar text={user.name} image={user.photo} />
							<View>
								<Text size="sm">{user.name || user.email.split('@')[0]}</Text>
								<Text size="sm">{user.email}</Text>
							</View>
						</View>
						<View className="flex-row">
							<Button
								variant="outline"
								disabled={isLoading}
								className="mt-3"
								onPress={logout}
							>
								{isLoading && <ButtonSpinner color="gray" />}
								<Button.Text>Disconnect</Button.Text>
							</Button>
						</View>
					</BaseCard>
					<BaseCard>
						<Text size="md">Backup & Restore</Text>
						<Text size="sm">Backup and restore your data to Google Drive.</Text>
						<Divider className="my-3" />
						<View>
							<Text size="sm">
								Size:{' '}
								{lastBackupSize
									? `${Math.round(lastBackupSize / 1024 / 1024)} MB`
									: 'None'}
							</Text>
							<Text size="sm">
								Frequency:{' '}
								{minimumIntervals.find(v => v.value === minimumInterval)
									?.title || 'Default'}
							</Text>
							<Text size="sm">
								Last backup:{' '}
								{lastBackupTime
									? $df(lastBackupTime, 'hh:mm A - DD MMMM YYYY')
									: 'Never'}
							</Text>
						</View>
						<View className="gap-2 mt-4 flex-row">
							<Button disabled={isUploading} onPress={onBackup}>
								{isUploading && <ButtonSpinner color="gray" />}
								<ButtonIcon name="upload" />
								<ButtonText>Backup</ButtonText>
							</Button>
							<Button disabled={isRestoring} onPress={onRestore}>
								{isRestoring && <ButtonSpinner color="gray" />}
								<ButtonIcon name="download" />
								<ButtonText>Restore</ButtonText>
							</Button>
							<BaseModal
								visible={minimumIntervalDialog}
								setVisible={setMinimumIntervalDialog}
								trigger={v => (
									<Button {...v} className="aspect-square">
										<ButtonIcon name="clock" />
									</Button>
								)}
							>
								<FlashList
									contentContainerClassName="px-4 pt-4 pb-16"
									contentContainerStyle={{ flexGrow: 1 }}
									data={minimumIntervals}
									renderItem={({ item }) => (
										<BaseCard
											className={cn('mb-2', {
												'bg-black dark:bg-white':
													item.value === minimumInterval,
											})}
											onPress={() => {
												setMinimumInterval(item.value)
												setMinimumIntervalDialog(false)
											}}
										>
											<Text
												className={cn({
													'text-white dark:text-black font-bold':
														item.value === minimumInterval,
												})}
											>
												{item.title}
											</Text>
										</BaseCard>
									)}
								/>
							</BaseModal>
						</View>
					</BaseCard>
				</View>
			) : (
				<BaseCard className="mt-3">
					<Text size="md">Google Drive Backup</Text>
					<Text size="sm">
						Connect your google account to backup and restore your data to
						Google Drive. Make sure to grant the necessary permissions to the
						app.
					</Text>
					<Divider className="my-3" />
					<View>
						<Button onPress={login} disabled={isLoading} className="mt-3">
							{isLoading && <ButtonSpinner color="gray" />}
							<ButtonText>Connect Google</ButtonText>
						</Button>
					</View>
				</BaseCard>
			)}

			{/* <Card size="lg" variant="outline" className="mt-3">
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
			</Card> */}
		</ScrollView>
	)
}
