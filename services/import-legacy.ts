import { getDocumentAsync } from 'expo-document-picker'
import { Directory, File, Paths } from 'expo-file-system'
import { unzip } from 'react-native-zip-archive'
import { queryClient } from '@/context/QueryProvider'
import {
	attachments,
	attachables,
	patientMedicines,
	patients,
	records,
	taggablesTable,
	tags,
} from '@/drizzle/schema'
import { fs } from '@/utils/fs'
import { log } from '@/utils/logs'

const IMPORT_DIR = 'import-legacy'
const ATTACHMENTS_DIR = 'attachments'

type TLegacyAsset = {
	uri?: string
	name?: string
	mime?: string
	size?: number
}

type TLegacyPatient = {
	id?: number
	name?: string
	dob?: string
	gender?: string
	edd?: string
	avatar?: TLegacyAsset | null
	createdAt?: string
	updatedAt?: string
}

type TLegacyRecord = {
	id?: number
	patientId?: number
	text?: string
	date?: string
	amount?: number
	tags?: string[]
	attachments?: TLegacyAsset[]
	createdAt?: string
	updatedAt?: string
}

const getFileName = (uri?: string) => uri?.split('/').pop() ?? ''

const formatError = (error: unknown) => {
	if (error instanceof Error) {
		return error.message || error.name || 'Unknown error'
	}
	if (typeof error === 'string') {
		return error
	}
	return 'Error importing legacy data'
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

const safeJsonParse = <T>(value: string, fallback: T): T => {
	try {
		return JSON.parse(value) as T
	} catch {
		return fallback
	}
}

export const $importLegacy = async () => {
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
		const filesByName = new Map(files.map(file => [file.name, file]))
		const recordsFile = filesByName.get('records.json')
		const patientsFile = filesByName.get('patients.json')

		if (!recordsFile || !patientsFile) {
			throw new Error(
				'Legacy import requires records.json and patients.json in the zip file',
			)
		}

		const legacyPatients = safeJsonParse<TLegacyPatient[]>(
			await patientsFile.text(),
			[],
		).filter(item => !!item?.name)
		const legacyRecords = safeJsonParse<TLegacyRecord[]>(
			await recordsFile.text(),
			[],
		)

		const { db } = await import('@/drizzle/db')

		await db.delete(attachables)
		await db.delete(taggablesTable)
		await db.delete(patientMedicines)
		await db.delete(records)
		await db.delete(patients)
		await db.delete(tags)
		await db.delete(attachments)

		fs.createDirectory(ATTACHMENTS_DIR)

		const copiedAttachmentIdByName = new Map<string, number>()
		const ensureAttachment = async (asset?: TLegacyAsset | null) => {
			const fileName = getFileName(asset?.uri)
			if (!fileName) return null

			const existingId = copiedAttachmentIdByName.get(fileName)
			if (existingId) return existingId

			const source = filesByName.get(fileName)
			if (!source?.exists) return null

			const destination = new File(Paths.document, ATTACHMENTS_DIR, fileName)
			if (destination.exists) {
				destination.delete()
			}
			source.copy(destination)

			const info = destination.info()
			const inserted = await db
				.insert(attachments)
				.values({
					uri: destination.uri.replace(Paths.document.uri, ''),
					name: asset?.name || destination.name,
					mime: asset?.mime || null,
					size: asset?.size ?? info.size ?? null,
				})
				.returning()
			const id = inserted[0]?.id
			if (!id) return null

			copiedAttachmentIdByName.set(fileName, id)
			return id
		}

		const patientIdMap = new Map<number, number>()

		for (const legacyPatient of legacyPatients) {
			const avatarId = await ensureAttachment(legacyPatient.avatar)
			const inserted = await db
				.insert(patients)
				.values({
					name: legacyPatient.name || 'Unknown',
					dob: legacyPatient.dob || null,
					gender: legacyPatient.gender || null,
					edd: legacyPatient.edd || null,
					avatarId,
					createdAt: legacyPatient.createdAt || new Date().toISOString(),
					updatedAt:
						legacyPatient.updatedAt ||
						legacyPatient.createdAt ||
						new Date().toISOString(),
				})
				.returning()
			if (legacyPatient.id && inserted[0]?.id) {
				patientIdMap.set(legacyPatient.id, inserted[0].id)
			}
		}

		const tagIdMap = new Map<string, number>()
		const getTagId = async (name: string) => {
			const key = name.trim()
			if (!key) return null
			if (tagIdMap.has(key)) return tagIdMap.get(key) ?? null
			const inserted = await db.insert(tags).values({ name: key }).returning()
			const id = inserted[0]?.id
			if (!id) return null
			tagIdMap.set(key, id)
			return id
		}

		for (const legacyRecord of legacyRecords) {
			const mappedPatientId = legacyRecord.patientId
				? patientIdMap.get(legacyRecord.patientId)
				: null
			if (!mappedPatientId || !legacyRecord.date) continue

			const insertedRecord = await db
				.insert(records)
				.values({
					patientId: mappedPatientId,
					text: legacyRecord.text || null,
					date: legacyRecord.date,
					amount: legacyRecord.amount ?? 0,
					createdAt: legacyRecord.createdAt || new Date().toISOString(),
					updatedAt:
						legacyRecord.updatedAt ||
						legacyRecord.createdAt ||
						new Date().toISOString(),
				})
				.returning()

			const recordId = insertedRecord[0]?.id
			if (!recordId) continue

			for (const tagName of legacyRecord.tags ?? []) {
				const tagId = await getTagId(tagName)
				if (!tagId) continue
				await db.insert(taggablesTable).values({
					recordId,
					tagId,
				})
			}

			for (const legacyAttachment of legacyRecord.attachments ?? []) {
				const attachmentId = await ensureAttachment(legacyAttachment)
				if (!attachmentId) continue
				await db.insert(attachables).values({
					recordId,
					attachmentId,
				})
			}
		}

		const referencedNames = new Set(copiedAttachmentIdByName.keys())
		const localFiles = fs.getFiles(ATTACHMENTS_DIR)
		const orphanedLocalFiles = localFiles.filter(
			file => !referencedNames.has(file.name),
		)
		if (orphanedLocalFiles.length) {
			fs.removeMany(orphanedLocalFiles.map(file => file.uri))
		}

		await queryClient.invalidateQueries()

		return {
			success: true,
			message: 'Legacy data imported successfully',
		}
	} catch (error) {
		const message = formatError(error)
		log('[import-legacy]: error', message)
		return {
			success: false,
			message,
		}
	} finally {
		if (importDirectory.exists) {
			importDirectory.delete()
		}
	}
}
