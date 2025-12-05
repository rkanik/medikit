import { GoogleDrive } from '@/api/drive'
import { TPatient, TRecord } from '@/types/database'
import { $df } from '@/utils/dayjs'
import { fs } from '@/utils/fs'
import { log } from '@/utils/logs'
import { sleep } from '@/utils/sleep'
import { storage } from '@/utils/storage'
import { createNotification } from './notification'

export const backup = async () => {
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

		log(`[backup]: starting backup...`)
		const records = storage.getArray<TRecord>('records')
		log(`[backup]: ${records.length} records`)

		const patients = storage.getArray<TPatient>('patients')
		log(`[backup]: ${patients.length} patients`)

		const allAvatarFiles = fs.getFiles('avatars')
		log(`[backup]: ${allAvatarFiles.length} all avatars`)

		const allAttachmentFiles = fs.getFiles('attachments')
		log(`[backup]: ${allAttachmentFiles.length} all attachments`)

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
		log(`[backup]: ${avatars.length} avatars`)

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
		log(`[backup]: ${attachments.length} attachments`)

		const extraAvatarFiles = allAvatarFiles.filter(x => {
			return !avatars.some(y => x.uri === y.uri)
		})
		log(`[backup]: ${extraAvatarFiles.length} extra avatars`)

		const extraAttachmentFiles = allAttachmentFiles.filter(x => {
			return !attachments.some(y => x.uri === y.uri)
		})
		log(`[backup]: ${extraAttachmentFiles.length} extra attachments`)

		log(`[backup]: removing extra avatars...`)
		fs.removeMany(extraAvatarFiles.map(v => v.uri))
		log(`[backup]: removing extra attachments...`)
		fs.removeMany(extraAttachmentFiles.map(v => v.uri))

		const base = fs.getDirectory().uri

		log(`[backup]: creating patients.json file...`)
		const patientsFile = fs.createJsonFile(
			patients.map(v => ({
				...v,
				avatar: (v.avatar?.uri || '').replace(base, ''),
			})),
			'patients.json',
		)

		log(`[backup]: creating records.json file...`)
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

		log(`[backup]: uploading all files...`)
		const drive = new GoogleDrive()
		const { error } = await drive.upload(
			[...jsonFiles, ...avatars, ...attachments],
			{
				onProgress(event) {
					n.update({
						title: `Backup (${Math.round(event.progress)}%)`,
						body: `${event.file.uri.split('/').pop() || 'Unknown file'}`,
					})
				},
				onError(event) {
					n.update({
						title: `Failed!`,
						body: event.error?.message || 'Error while backing up data.',
					})
				},
				onComplete() {
					sleep(500).then(() => {
						n.update({
							title: `Success!`,
							body: `Backup completed at ${$df(
								new Date(),
								'DD MMM, YYYY hh:mm A',
							)}.`,
						})
					})
				},
			},
		)

		// If might delete previous backup on a new device
		if (patients.length && records.length) {
			log(`[backup]: finding extra files...`)
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

			log(`[backup]: ${extraDriveFiles.length} extra files`)
			log(`[backup]: deleting extra files...`)
			await drive.delete(extraDriveFiles.map(v => v.id))
			log(`[backup]: extra files deleted`)
		}

		log(`[backup]: backup completed`)
		storage.set('lastBackupTime', Date.now())
		return {
			success: true,
			message: 'Backup completed successfully',
		}
	} catch (error) {
		log(`[backup]: error`, error)
		return {
			success: false,
			message: 'Backup failed',
		}
	}
}
