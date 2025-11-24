import { useMemo } from 'react'
import { Alert, Text, View } from 'react-native'

import { Box } from '@/components/ui/box'
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useGoogleDriveBackup } from '@/hooks/useGoogleDriveBackup'
import { useMedicalRecords } from '@/hooks/useMedicalRecords'

export default function BackupScreen() {
	const { records, replaceAll } = useMedicalRecords()
	const {
		isAuthenticated,
		backupToDrive,
		restoreLatestBackup,
		isSyncing,
		authState,
	} = useGoogleDriveBackup()

	const { user, isLoading, error, login, logout, setError } = useAuth()

	const stats = useMemo(() => {
		const attachments = records.reduce(
			(sum, record) => sum + record.attachments.length,
			0,
		)
		return {
			records: records.length,
			attachments,
		}
	}, [records])

	const handleBackup = async () => {
		try {
			await backupToDrive(records)
			Alert.alert('Backup complete', 'Your data was uploaded to Google Drive.')
		} catch (error: any) {
			Alert.alert('Backup failed', error.message)
		}
	}

	const handleRestore = async () => {
		try {
			const restored = await restoreLatestBackup()
			replaceAll(restored.records)
			Alert.alert(
				'Restore complete',
				`Loaded ${restored.records.length} records from ${restored.backupFile.name}.`,
			)
		} catch (error: any) {
			Alert.alert('Restore failed', error.message)
		}
	}

	return (
		<Box className="flex-1 bg-white dark:bg-black px-4 py-6 gap-4">
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

			<View className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 gap-4">
				<View className="flex-row justify-between items-center">
					<Text className="text-base font-semibold text-black dark:text-white">
						Google account
					</Text>
					{user ? (
						<Text className="text-xs text-emerald-600 dark:text-emerald-400">
							Connected
						</Text>
					) : (
						<Text className="text-xs text-rose-500">Not connected</Text>
					)}
				</View>
				<View className="flex-row gap-2">
					{user ? (
						<Button variant="outline" onPress={logout} disabled={isLoading}>
							{isLoading && <ButtonSpinner color="gray" />}
							<ButtonText>Disconnect</ButtonText>
						</Button>
					) : (
						<Button onPress={login} disabled={isLoading}>
							{isLoading && <ButtonSpinner color="gray" />}
							<ButtonText>Connect Google</ButtonText>
						</Button>
					)}
				</View>
				<Text className="text-xs text-slate-500">
					Last backup:{' '}
					{authState?.lastBackupAt
						? new Date(authState.lastBackupAt).toLocaleString()
						: 'Never'}
				</Text>
				<Text className="text-xs text-slate-500">
					Last restore:{' '}
					{authState?.lastRestoreAt
						? new Date(authState.lastRestoreAt).toLocaleString()
						: 'Never'}
				</Text>
			</View>

			<View className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 gap-3">
				<Text className="text-base font-semibold text-black dark:text-white">
					Local data
				</Text>
				<Text className="text-sm text-slate-500">
					{stats.records} records containing {stats.attachments} attachments are
					stored only on this device.
				</Text>
				<Button onPress={handleBackup} disabled={!isAuthenticated || isSyncing}>
					<ButtonText>{isSyncing ? 'Working...' : 'Backup now'}</ButtonText>
				</Button>
				<Button
					variant="outline"
					onPress={handleRestore}
					disabled={!isAuthenticated || isSyncing}
				>
					<ButtonText>Restore latest backup</ButtonText>
				</Button>
			</View>
		</Box>
	)
}
