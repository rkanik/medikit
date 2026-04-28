import { Alert as RNAlert, ScrollView, View } from 'react-native'

import { BaseCard } from '@/components/base/card'
import { BaseModal } from '@/components/base/modal'
import { FlashList } from '@/components/FlashList'
import { Alert } from '@/components/ui/alert'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { Body, Subtitle, Text, Title } from '@/components/ui/text'
import { useAuth } from '@/context/AuthContext'
import { minimumIntervals, useBackgroundTask } from '@/services/background'
import { backup, useBackup } from '@/services/backup'
import { $export } from '@/services/export'
import { $import } from '@/services/import'
import { restore } from '@/services/restore'
import { $df } from '@/utils/dayjs'
import { Stack } from 'expo-router'
import { Fragment, useCallback, useState } from 'react'
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

	const onDisconnect = useCallback(async () => {
		RNAlert.alert(
			'Disconnect from Google Drive',
			'Are you sure you want to disconnect from Google Drive? This will remove all your data from Google Drive.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{ text: 'Disconnect', onPress: logout },
			],
		)
	}, [logout])

	const onImport = useCallback(async () => {
		RNAlert.alert(
			'Import from Device',
			'Are you sure you want to import your data from your device? This will overwrite your existing data.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{ text: 'Import', onPress: $import },
			],
		)
	}, [])

	const { lastBackupTime, lastBackupSize } = useBackup()
	const { minimumInterval, setMinimumInterval } = useBackgroundTask()
	const [minimumIntervalDialog, setMinimumIntervalDialog] = useState(false)

	return (
		<ScrollView
			contentContainerClassName="px-4 pb-20"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Stack.Screen options={{ title: 'Backup & Restore' }} />
			<Alert
				inverted
				type="success"
				title="Google Drive Backup"
				subtitle="Keep your medical histories safe by syncing them to your own Drive. No external servers are involved — everything stays on your device until you tap 'Upload to Google Drive'."
			/>
			{user ? (
				<View className="mt-4 gap-4">
					<BaseCard>
						<Title>Google Account</Title>
						<Subtitle>
							This account will be used to backup and restore your data to
							Google Drive.
						</Subtitle>
						<Divider className="my-3" />
						<View className="items-center gap-2 flex-row">
							<Avatar
								text={user.name}
								image={user.photo}
								className="w-16 h-16"
							/>
							<View>
								<Title>{user.name || user.email.split('@')[0]}</Title>
								<Subtitle>{user.email}</Subtitle>
							</View>
						</View>
						<View className="flex-row">
							<Button
								disabled={isLoading}
								className="mt-3"
								icon="log-out"
								text="Disconnect"
								loading={isLoading}
								onPress={onDisconnect}
							/>
						</View>
					</BaseCard>
					<BaseCard>
						<Title>Backup & Restore</Title>
						<Subtitle>Backup and restore your data to Google Drive.</Subtitle>
						<Divider className="my-3" />
						<View>
							<Body>
								Size:{' '}
								{lastBackupSize
									? `${Math.round(lastBackupSize / 1024 / 1024)} MB`
									: 'None'}
							</Body>
							<Body>
								Frequency:{' '}
								{minimumIntervals.find(v => v.value === minimumInterval)
									?.title || 'Default'}
							</Body>
							<Body>
								Last backup:{' '}
								{lastBackupTime
									? $df(lastBackupTime, 'hh:mm A - DD MMMM YYYY')
									: 'Never'}
							</Body>
						</View>
						<View className="gap-2 mt-4 flex-row">
							<Button
								disabled={isUploading}
								icon="upload"
								text="Backup"
								loading={isUploading}
								onPress={onBackup}
							/>
							<Button
								disabled={isRestoring}
								icon="download"
								text="Restore"
								loading={isRestoring}
								onPress={onRestore}
							/>
							<BaseModal
								visible={minimumIntervalDialog}
								setVisible={setMinimumIntervalDialog}
								trigger={v => <Button {...v} icon="clock" />}
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
				<Fragment>
					{error && (
						<Alert
							type="error"
							title="Error!"
							className="mt-3"
							subtitle={error}
							onClose={() => setError(null)}
						/>
					)}
					<BaseCard className="mt-3">
						<Title>Google Drive Backup</Title>
						<Subtitle>
							Connect your google account to backup and restore your data to
							Google Drive. Make sure to grant the necessary permissions to the
							app.
						</Subtitle>
						<Divider className="my-3" />
						<View className="flex-row">
							<Button
								icon="log-in"
								text="Connect Google"
								loading={isLoading}
								disabled={isLoading}
								onPress={login}
							/>
						</View>
					</BaseCard>
				</Fragment>
			)}

			<BaseCard className="mt-4">
				<Title>Import & Export</Title>
				<Subtitle>
					Import and export your data from and to your device.
				</Subtitle>
				<Divider className="my-3" />
				<View className="gap-2 mt-4 flex-row">
					<Button icon="arrow-down" text="Import" onPress={onImport} />
					<Button icon="arrow-up" text="Export" onPress={$export} />
				</View>
			</BaseCard>

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
