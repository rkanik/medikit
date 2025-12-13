import { GoogleDrive } from '@/api/drive'
import { TPatient, TRecord } from '@/types/database'
import { $df } from '@/utils/dayjs'
import { fs } from '@/utils/fs'
import { log } from '@/utils/logs'
import { storage } from '@/utils/storage'
import { useMMKVNumber } from 'react-native-mmkv'
import { createNotification } from './notification'

export const useBackup = () => {
	const [lastBackupTime] = useMMKVNumber(storage.lastBackupTime.key)
	const [lastBackupSize] = useMMKVNumber(storage.lastBackupSize.key)
	return {
		lastBackupTime,
		lastBackupSize,
	}
}

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

		const records = storage.getArray<TRecord>('records')
		const patients = storage.getArray<TPatient>('patients')

		const files = fs.getFiles('files')

		const base = fs.getDirectory().uri
		const drive = new GoogleDrive()
		const driveFiles = await drive.find()

		const relatedFiles = files.filter(v => {
			return (
				patients.some(p => p.avatar?.uri === v.uri) ||
				records.some(r => r.attachments?.some(a => a.uri === v.uri))
			)
		})

		const filteredFiles = relatedFiles.filter(v => {
			return !driveFiles.data?.some(x => x.name === v.uri.split('/').pop())
		})

		const jsonFiles = [
			fs.createJsonFile(
				records.map(v => ({
					...v,
					attachments: v.attachments
						.filter(v => v.uri)
						.map(v => v.uri!.replace(base, '')),
				})),
				'records.json',
			),
			fs.createJsonFile(
				patients.map(v => ({
					...v,
					avatar: (v.avatar?.uri || '').replace(base, ''),
				})),
				'patients.json',
			),
		].map(v => ({
			uri: v.uri!,
			size: v.size,
			fileId: driveFiles.data?.find(x => x.name === v.uri!.split('/').pop())
				?.id,
		}))

		const uploadFiles = [...jsonFiles, ...filteredFiles]

		const totalSize = relatedFiles.reduce((a, f) => a + (f.size || 0), 0)
		storage.lastBackupSize.set(totalSize)

		await drive.upload(uploadFiles, {
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
		})

		if (patients.length && records.length) {
			const extraFiles = files.filter(v => {
				return (
					!patients.some(p => p.avatar?.uri === v.uri) &&
					!records.some(r => r.attachments?.some(a => a.uri === v.uri))
				)
			})
			const extraDriveFiles = (driveFiles.data || []).filter(v => {
				return (
					!['application/json', 'application/vnd.google-apps.folder'].includes(
						v.mimeType,
					) &&
					!patients.some(patient => {
						return patient.avatar?.uri?.split('/').pop() === v.name
					}) &&
					!records.some(record => {
						return record.attachments?.some(attachment => {
							return attachment.uri?.split('/').pop() === v.name
						})
					})
				)
			})
			fs.removeMany(extraFiles.map(v => v.uri))
			await drive.delete(extraDriveFiles.map(v => v.id))
		}

		storage.lastBackupTime.set(Date.now())
		n.update({
			title: `Success!`,
			body: `Backup completed at ${$df(new Date(), 'DD MMM, YYYY hh:mm A')}.`,
		})
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
