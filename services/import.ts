import { queryClient } from '@/context/QueryProvider'
import { db, replaceDatabaseFromCache } from '@/drizzle/db'
import { fs } from '@/utils/fs'
import { log } from '@/utils/logs'
import { getDocumentAsync } from 'expo-document-picker'
import { Directory, File, Paths } from 'expo-file-system'
import { unzip } from 'react-native-zip-archive'

const DB_FILE_NAME = 'index.db'
const ATTACHMENTS_DIR = 'attachments'
const IMPORT_DIR = 'import'

const getFileName = (uri: string) => uri.split('/').pop() ?? ''

const formatError = (error: unknown) => {
	if (error instanceof Error) {
		return error.message || error.name || 'Unknown error'
	}
	if (typeof error === 'string') {
		return error
	}
	return 'Error importing data'
}

const toAttachmentFile = (uri: string) => {
	if (uri.startsWith('file://') || uri.startsWith('content://')) {
		return new File(uri)
	}
	return new File(Paths.document, ...uri.split('/').filter(Boolean))
}

const findImportFiles = (directory: Directory): File[] => {
	const files: File[] = []
	for (const item of directory.list()) {
		if (item instanceof File) {
			files.push(item)
		} else if (item instanceof Directory) {
			files.push(...findImportFiles(item))
		}
	}
	return files
}

export const $import = async () => {
	const importDirectory = new Directory(Paths.cache, IMPORT_DIR)

	try {
		const result = await getDocumentAsync({
			type: ['application/zip'],
			base64: false,
			multiple: false,
			copyToCacheDirectory: true,
		})

		if (!result.assets?.length) {
			return {
				success: false,
				message: 'No file selected',
			}
		}

		if (importDirectory.exists) {
			importDirectory.delete()
		}
		importDirectory.create()

		await unzip(result.assets[0].uri, importDirectory.uri)

		const files = findImportFiles(importDirectory)
		const dbSource = files.find(file => file.name === DB_FILE_NAME)
		if (!dbSource) {
			throw new Error('Database file not found in import archive')
		}

		const cacheDbFile = new File(Paths.cache, DB_FILE_NAME)
		if (cacheDbFile.exists) {
			cacheDbFile.delete()
		}
		dbSource.copy(cacheDbFile)

		const info = cacheDbFile.info()
		if (!info.exists || !info.size) {
			throw new Error('Imported database file is empty or missing')
		}

		replaceDatabaseFromCache()

		const importFileMap = new Map(files.map(file => [file.name, file]))
		const dbAttachments = await db.query.attachments.findMany()
		const validAttachmentNames = new Set(
			dbAttachments
				.map(attachment => getFileName(attachment.uri))
				.filter(Boolean),
		)

		fs.createDirectory(ATTACHMENTS_DIR)

		for (const attachment of dbAttachments) {
			const fileName = getFileName(attachment.uri)
			if (!fileName) continue

			const source = importFileMap.get(fileName)
			if (!source?.exists) continue

			const destination = toAttachmentFile(attachment.uri)
			if (destination.exists) {
				destination.delete()
			}
			source.copy(destination)
		}

		const localFiles = fs.getFiles(ATTACHMENTS_DIR)
		const orphanedLocalFiles = localFiles.filter(
			file => !validAttachmentNames.has(file.name),
		)
		if (orphanedLocalFiles.length) {
			fs.removeMany(orphanedLocalFiles.map(file => file.uri))
		}

		await queryClient.invalidateQueries()

		return {
			success: true,
			message: 'Data imported successfully',
		}
	} catch (error) {
		const message = formatError(error)
		log('[import]: error', message)
		return {
			success: false,
			message,
		}
	} finally {
		if (importDirectory.exists) {
			importDirectory.delete()
		}
		const cacheDbFile = new File(Paths.cache, DB_FILE_NAME)
		if (cacheDbFile.exists) {
			cacheDbFile.delete()
		}
	}
}
