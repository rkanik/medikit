import { File, Paths } from 'expo-file-system'
import { openDatabaseSync } from 'expo-sqlite'
import { GoogleDrive } from '@/api/drive'
import { queryClient } from '@/context/QueryProvider'
import { replaceDatabaseFromCache } from '@/drizzle/db'
import { fs } from '@/utils/fs'
import { log } from '@/utils/logs'
import { createNotification } from './notification'

const DB_FILE_NAME = 'index.db'
const ATTACHMENTS_DIR = 'attachments'

const getFileName = (uri: string) => uri.split('/').pop() ?? ''

const formatError = (error: unknown) => {
	if (error instanceof Error) {
		return error.message || error.name || 'Unknown error'
	}
	if (typeof error === 'string') {
		return error
	}
	if (error && typeof error === 'object') {
		const record = error as Record<string, unknown>
		if (typeof record.message === 'string' && record.message) {
			return record.message
		}
		if (typeof record.code === 'string' && record.code) {
			return record.code
		}
	}
	return 'Error restoring data'
}

const toAttachmentFile = (uri: string) => {
	if (uri.startsWith('file://') || uri.startsWith('content://')) {
		return new File(uri)
	}
	return new File(Paths.document, ...uri.split('/').filter(Boolean))
}

const getAttachmentsFromBackup = () => {
	const backupDb = openDatabaseSync(DB_FILE_NAME, {}, Paths.cache.uri)
	try {
		const tables = backupDb.getAllSync<{ name: string }>(
			"SELECT name FROM sqlite_master WHERE type='table' AND name='attachments'",
		)
		if (!tables.length) return []
		return backupDb.getAllSync<{ uri: string }>('SELECT uri FROM attachments')
	} catch (error) {
		log('[restore2]: failed to read attachments from backup', formatError(error))
		return []
	} finally {
		backupDb.closeSync()
	}
}

export const restore2 = async () => {
	let n: ReturnType<typeof createNotification> | null = null

	try {
		n = createNotification({
			identifier: 'restore',
			trigger: {
				channelId: 'restore',
			},
			content: {
				title: 'Restore',
				body: 'Preparing to restore data...',
				sound: false,
			},
		})
		await n.schedule()

		const drive = new GoogleDrive()
		const driveFiles = await drive.find()
		const driveFileMap = new Map(
			(driveFiles.data ?? []).map(file => [file.name, file]),
		)

		const dbDriveFile = driveFileMap.get(DB_FILE_NAME)
		if (!dbDriveFile?.id) {
			throw new Error('Database backup not found on Google Drive')
		}

		const dbFile = new File(Paths.cache, DB_FILE_NAME)
		if (dbFile.exists) {
			dbFile.delete()
		}

		n.update({ body: 'Downloading database...' })
		const downloadResult = await drive.download(dbDriveFile.id, dbFile)
		if (!downloadResult || ('error' in downloadResult && downloadResult.error)) {
			throw new Error('Failed to download database from Google Drive')
		}

		const info = dbFile.info()
		if (!info.exists || !info.size) {
			throw new Error('Downloaded database file is empty or missing')
		}

		const dbAttachments = getAttachmentsFromBackup()
		replaceDatabaseFromCache()

		const validAttachmentNames = new Set(
			dbAttachments.map(attachment => getFileName(attachment.uri)).filter(Boolean),
		)

		fs.createDirectory(ATTACHMENTS_DIR)

		for (const attachment of dbAttachments) {
			const fileName = getFileName(attachment.uri)
			if (!fileName) continue

			const localFile = toAttachmentFile(attachment.uri)
			if (localFile.exists) continue

			const driveFile = driveFileMap.get(fileName)
			if (!driveFile?.id) continue

			n.update({ body: `Downloading ${fileName}...` })
			const result = await drive.download(driveFile.id, localFile)
			if (!result || ('error' in result && result.error)) {
				log(`[restore2]: failed to download ${fileName}`, formatError(result))
			}
		}

		const localFiles = fs.getFiles(ATTACHMENTS_DIR)
		const orphanedLocalFiles = localFiles.filter(
			file => !validAttachmentNames.has(file.name),
		)
		if (orphanedLocalFiles.length) {
			fs.removeMany(orphanedLocalFiles.map(file => file.uri))
		}

		await queryClient.invalidateQueries()

		n.update({
			title: 'Success!',
			body: 'Data restored successfully',
		})

		return {
			success: true,
			message: 'Data restored successfully',
		}
	} catch (error) {
		const message = formatError(error)
		log('[restore2]: error', message)
		n?.update({
			title: 'Failed!',
			body: message,
		})
		return {
			success: false,
			message,
		}
	}
}
