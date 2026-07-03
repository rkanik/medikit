import { File, Paths } from 'expo-file-system'
import { backupDatabaseSync, openDatabaseSync } from 'expo-sqlite'
import { useMMKVNumber } from 'react-native-mmkv'
import { GoogleDrive } from '@/api/drive'
import { db } from '@/drizzle/db'
import { $df } from '@/utils/dayjs'
import { fs } from '@/utils/fs'
import { log } from '@/utils/logs'
import { paths } from '@/utils/paths'
import { storage } from '@/utils/storage'
import { createNotification } from './notification'

const DB_FILE_NAME = 'index.db'
const ATTACHMENTS_DIR = 'attachments'
const FOLDER_MIME = 'application/vnd.google-apps.folder'

const getFileName = (uri: string) => uri.split('/').pop() ?? ''

const createDatabaseBackupFile = () => {
	const backupFile = new File(Paths.cache, DB_FILE_NAME)
	if (backupFile.exists) {
		backupFile.delete()
	}

	const destDb = openDatabaseSync(DB_FILE_NAME, {}, Paths.cache.uri)
	try {
		backupDatabaseSync({
			sourceDatabase: db.$client,
			destDatabase: destDb,
		})
	} finally {
		destDb.closeSync()
	}

	const info = backupFile.info()
	if (!info.exists || !info.size) {
		throw new Error('Database backup file is empty or missing')
	}

	log('[backup2]: database backup created', info.size)
	return backupFile
}

export const useBackup = () => {
	const [lastBackupTime] = useMMKVNumber(storage.lastBackupTime.key)
	const [lastBackupSize] = useMMKVNumber(storage.lastBackupSize.key)
	return {
		lastBackupTime,
		lastBackupSize,
	}
}

export const backup2 = async () => {
	try {
		const n = createNotification({
			identifier: 'backup',
			trigger: {
				channelId: 'backup',
			},
			content: {
				title: 'Backup',
				body: 'Preparing to backup data...',
				sound: false,
			},
		})
		await n.schedule()

		const drive = new GoogleDrive()
		const driveFiles = await drive.find()
		const driveFileMap = new Map(
			(driveFiles.data ?? []).map(file => [file.name, file]),
		)

		const dbAttachments = await db.query.attachments.findMany()
		const validAttachmentNames = new Set(
			dbAttachments.map(attachment => getFileName(attachment.uri)).filter(Boolean),
		)

		const localFiles = fs.getFiles(ATTACHMENTS_DIR)
		const orphanedLocalFiles = localFiles.filter(
			file => !validAttachmentNames.has(file.name),
		)
		if (orphanedLocalFiles.length) {
			fs.removeMany(orphanedLocalFiles.map(file => file.uri))
		}

		const orphanedDriveFiles = (driveFiles.data ?? []).filter(file => {
			if (file.mimeType === FOLDER_MIME) return false
			if (file.name === DB_FILE_NAME) return false
			return !validAttachmentNames.has(file.name)
		})
		if (orphanedDriveFiles.length) {
			await drive.delete(orphanedDriveFiles.map(file => file.id))
		}

		const backupDbFile = createDatabaseBackupFile()
		const uploadFiles: { uri: string; fileId?: string }[] = [
			{
				uri: backupDbFile.uri,
				fileId: driveFileMap.get(DB_FILE_NAME)?.id,
			},
		]

		for (const attachment of dbAttachments) {
			const fileName = getFileName(attachment.uri)
			if (!fileName || driveFileMap.has(fileName)) continue

			const localFile = new File(paths.document(attachment.uri)!)
			if (!localFile.exists) continue

			uploadFiles.push({ uri: localFile.uri })
		}

		const totalSize =
			(backupDbFile.info().size ?? 0) +
			dbAttachments.reduce((total, attachment) => {
				const localFile = new File(paths.document(attachment.uri)!)
				return total + (localFile.exists ? (localFile.info().size ?? 0) : 0)
			}, 0)
		storage.lastBackupSize.set(totalSize)

		const uploadResult = await drive.upload(uploadFiles, {
			onProgress(event) {
				n.update({
					title: `Backup (${Math.round(event.progress)}%)`,
					body: `${event.file.uri.split('/').pop() || 'Unknown file'}`,
				})
			},
			onError(event) {
				n.update({
					title: 'Failed!',
					body: event.error?.message || 'Error while backing up data.',
				})
			},
		})

		if (
			!uploadResult ||
			'error' in uploadResult && uploadResult.error ||
			!('results' in uploadResult) ||
			!uploadResult.results?.[0]?.data
		) {
			throw new Error('Failed to upload database to Google Drive')
		}

		storage.lastBackupTime.set(Date.now())
		n.update({
			title: 'Success!',
			body: `Backup completed at ${$df(new Date(), 'DD MMM, YYYY hh:mm A')}.`,
		})

		return {
			success: true,
			message: 'Backup completed successfully',
		}
	} catch (error) {
		log(`[backup2]: error`, error)
		return {
			success: false,
			message: 'Backup failed',
		}
	}
}
