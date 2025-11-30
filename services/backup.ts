import { GoogleDrive } from '@/api/drive'
import { TPatient, TRecord } from '@/types/database'
import { fs } from '@/utils/fs'
import { storage } from '@/utils/storage'

export const backup = async () => {
	try {
		console.log(`[backup]: starting backup...`)
		const records = storage.getArray<TRecord>('records')
		console.log(`[backup]: ${records.length} records`)

		const patients = storage.getArray<TPatient>('patients')
		console.log(`[backup]: ${patients.length} patients`)

		const allAvatarFiles = fs.getFiles('avatars')
		console.log(`[backup]: ${allAvatarFiles.length} all avatars`)

		const allAttachmentFiles = fs.getFiles('attachments')
		console.log(`[backup]: ${allAttachmentFiles.length} all attachments`)

		const avatars = allAvatarFiles
			.filter(v => !!v.uri)
			.filter(v => {
				return patients.some(patient => {
					return patient.avatar?.uri === v.uri
				})
			})
			.map(v => ({
				uri: v.uri!,
				folder: 'avatars',
			}))
		console.log(`[backup]: ${avatars.length} avatars`)

		const attachments = allAttachmentFiles
			.filter(v => !!v.uri)
			.filter(v => {
				return records.some(record => {
					return record.attachments?.some(attachment => {
						return attachment.uri === v.uri
					})
				})
			})
			.map(v => ({
				uri: v.uri!,
				folder: 'attachments',
			}))
		console.log(`[backup]: ${attachments.length} attachments`)

		const extraAvatarFiles = allAvatarFiles.filter(x => {
			return !avatars.some(y => x.uri === y.uri)
		})
		console.log(`[backup]: ${extraAvatarFiles.length} extra avatars`)

		const extraAttachmentFiles = allAttachmentFiles.filter(x => {
			return !attachments.some(y => x.uri === y.uri)
		})
		console.log(`[backup]: ${extraAttachmentFiles.length} extra attachments`)

		console.log(`[backup]: removing extra avatars...`)
		fs.removeMany(extraAvatarFiles.map(v => v.uri))
		console.log(`[backup]: removing extra attachments...`)
		fs.removeMany(extraAttachmentFiles.map(v => v.uri))

		const base = fs.getDirectory().uri

		console.log(`[backup]: creating patients.json file...`)
		const patientsFile = fs.createJsonFile(
			patients.map(v => ({
				...v,
				avatar: (v.avatar?.uri || '').replace(base, ''),
			})),
			'patients.json',
		)

		console.log(`[backup]: creating records.json file...`)
		const recordsFile = fs.createJsonFile(
			records.map(v => ({
				...v,
				attachments: v.attachments
					.filter(v => v.uri)
					.map(v => v.uri!.replace(base, '')),
			})),
			'records.json',
		)

		const jsonFiles = [recordsFile, patientsFile].map(v => ({
			uri: v.uri!,
			overwrite: true,
		}))

		console.log(`[backup]: uploading all files...`)
		const drive = new GoogleDrive()
		await drive.upload([...jsonFiles, ...avatars, ...attachments], {
			onProgress: async event => {
				console.log(`[backup]: onProgress`, event.progress)
			},
			onError: async event => {
				console.log(`[backup]: onError`, event.error)
			},
			onComplete: async event => {
				console.log(`[backup]: onComplete`, event.successCount)
			},
		})

		console.log(`[backup]: finding extra files...`)
		const driveFiles = await drive.find()
		const extraDriveFiles = (driveFiles.data || []).filter(v => {
			return (
				!['application/json', 'application/vnd.google-apps.folder'].includes(
					v.mimeType,
				) &&
				![...avatars, ...attachments].some(
					x => x.uri.split('/').pop() === v.name,
				)
			)
		})

		console.log(`[backup]: ${extraDriveFiles.length} extra files`)
		console.log(`[backup]: deleting extra files...`)
		await drive.delete(extraDriveFiles.map(v => v.id))
		console.log(`[backup]: extra files deleted`)

		console.log(`[backup]: backup completed`)
		storage.set('lastBackupTime', Date.now())
		return {
			success: true,
			message: 'Backup completed successfully',
		}
	} catch (error) {
		console.log(`[backup]: error`, error)
		return {
			success: false,
			message: 'Backup failed',
		}
	}
}
