import { appName } from '@/const'
import { TPatient, TRecord } from '@/types/database'
import { fs } from '@/utils/fs'
import { storage } from '@/utils/storage'
import { Directory, File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { zip } from 'react-native-zip-archive'

export const $export = async () => {
	try {
		const records = storage.getArray<TRecord>('records')
		const patients = storage.getArray<TPatient>('patients')

		const directory = new Directory(Paths.cache, 'export')
		directory.create({
			overwrite: false,
			idempotent: true,
			intermediates: true,
		})

		const recordsFile = new File(Paths.cache, 'export/records.json')
		const patientsFile = new File(Paths.cache, 'export/patients.json')

		recordsFile.write(JSON.stringify(records))
		patientsFile.write(JSON.stringify(patients))

		const files = fs.getFiles('files')
		const relatedFiles = files.filter(v => {
			return (
				patients.some(p => p.avatar?.uri === v.uri) ||
				records.some(r => r.attachments?.some(a => a.uri === v.uri))
			)
		})

		for (const file of relatedFiles) {
			const destination = new File(
				Paths.cache,
				'export',
				file.uri.split('/').pop()!,
			)
			if (destination.exists) continue
			file.copy(destination)
		}

		if (patients.length && records.length) {
			const extraFiles = files.filter(v => {
				return (
					!patients.some(p => p.avatar?.uri === v.uri) &&
					!records.some(r => r.attachments?.some(a => a.uri === v.uri))
				)
			})
			fs.removeMany(extraFiles.map(v => v.uri))
		}

		const name = `${appName.split(' ').join('-').toLowerCase()}-export-${Date.now()}.zip`
		await zip(Paths.join(Paths.cache, 'export'), Paths.join(Paths.cache, name))

		const file = new File(Paths.cache, name)
		console.log(file.size, file.contentUri)

		await Sharing.shareAsync(file.uri, {
			mimeType: 'application/zip',
		})

		file.delete()
		directory.delete()

		return {
			success: true,
			message: 'Exported successfully!',
		}
	} catch (error) {
		return {
			success: false,
			message: (error as any)?.message || 'Export failed!',
		}
	}
}
