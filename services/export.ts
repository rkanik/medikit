import { Directory, File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { backupDatabaseSync, openDatabaseSync } from 'expo-sqlite'
import { zip } from 'react-native-zip-archive'
import { appName } from '@/const'
import { db } from '@/drizzle/db'
import { log } from '@/utils/logs'
import { paths } from '@/utils/paths'

const DB_FILE_NAME = 'index.db'
const EXPORT_DIR = 'export'

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

	return backupFile
}

export const $export = async () => {
	const exportDirectory = new Directory(Paths.cache, EXPORT_DIR)
	let zipFile: File | null = null

	try {
		if (exportDirectory.exists) {
			exportDirectory.delete()
		}
		exportDirectory.create()

		const dbAttachments = await db.query.attachments.findMany()
		const backupDbFile = createDatabaseBackupFile()
		backupDbFile.copy(new File(exportDirectory, DB_FILE_NAME))

		for (const attachment of dbAttachments) {
			const fileName = getFileName(attachment.uri)
			if (!fileName) continue

			const localFile = new File(paths.document(attachment.uri)!)
			if (!localFile.exists) continue

			const destination = new File(exportDirectory, fileName)
			if (destination.exists) continue
			localFile.copy(destination)
		}

		const name = `${appName.split(' ').join('-').toLowerCase()}-export-${Date.now()}.zip`
		zipFile = new File(Paths.cache, name)
		await zip(exportDirectory.uri, zipFile.uri)

		await Sharing.shareAsync(zipFile.uri, {
			mimeType: 'application/zip',
		})

		return {
			success: true,
			message: 'Exported successfully!',
		}
	} catch (error) {
		log('[export]: error', error)
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Export failed!',
		}
	} finally {
		if (exportDirectory.exists) {
			exportDirectory.delete()
		}
		const cacheDbFile = new File(Paths.cache, DB_FILE_NAME)
		if (cacheDbFile.exists) {
			cacheDbFile.delete()
		}
		if (zipFile?.exists) {
			zipFile.delete()
		}
	}
}
