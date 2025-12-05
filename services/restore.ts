import { GoogleDrive } from '@/api/drive'
import { log } from '@/utils/logs'
import { storage } from '@/utils/storage'
import { Directory, File, Paths } from 'expo-file-system'

const getFolderId = (data: any[] | null, folder: string) => {
	return data?.find(v => {
		return (
			v.name === folder && v.mimeType === 'application/vnd.google-apps.folder'
		)
	})?.id
}

export const restore = async () => {
	try {
		log('[restore]: starting restore...')

		const drive = new GoogleDrive()
		const files = await drive.find()

		const avatarId = getFolderId(files.data, 'avatars')
		const attachmentId = getFolderId(files.data, 'attachments')

		const avatars = (files.data || []).filter(v => {
			return v.parents.includes(avatarId)
		})

		const attachments = (files.data || []).filter(v => {
			return v.parents.includes(attachmentId)
		})

		const options = {
			intermediates: true,
			overwrite: false,
			idempotent: true,
		}

		new Directory(Paths.document, 'avatars').create(options)
		new Directory(Paths.document, 'attachments').create(options)

		for (const file of avatars) {
			log('[restore]: downloading avatar', file.name)
			await drive.download(
				file.id,
				new File(Paths.document, 'avatars', file.name),
			)
		}

		for (const file of attachments) {
			log('[restore]: downloading attachment', file.name)
			await drive.download(
				file.id,
				new File(Paths.document, 'attachments', file.name),
			)
		}

		const patients = files.data?.find(v => v.name === 'patients.json')
		const records = files.data?.find(v => v.name === 'records.json')

		const patientsFile = new File(Paths.cache, 'patients.json')
		const recordsFile = new File(Paths.cache, 'records.json')

		log('[restore]: downloading patients.json')
		await drive.download(patients.id, patientsFile)

		log('[restore]: downloading records.json')
		await drive.download(records.id, recordsFile)

		const patientsData = await patientsFile.text()
		const recordsData = await recordsFile.text()
		try {
			const x = JSON.parse(patientsData)
			if (Array.isArray(x)) {
				storage.set(
					'patients',
					JSON.stringify(
						x.map(v => ({
							...v,
							avatar: v.avatar
								? new File(Paths.document, v.avatar).info()
								: undefined,
						})),
					),
				)
			}
			const y = JSON.parse(recordsData)
			if (Array.isArray(y)) {
				storage.set(
					'records',
					JSON.stringify(
						y.map(v => ({
							...v,
							attachments: (v.attachments || []).map((v: string) => {
								return new File(Paths.document, v).info()
							}),
						})),
					),
				)
			}
		} catch {
			//
		}
		return {
			success: true,
			message: 'Data restored successfully',
		}
	} catch (error) {
		log('[restore]: error', error)
		return {
			success: false,
			message: 'Error restoring data',
		}
	}
}
