import type {
	TMedicine,
	TPatient,
	TPatientMedicine,
	TRecord,
} from '@/types/database'

import { Directory, File, Paths } from 'expo-file-system'

import { GoogleDrive } from '@/api/drive'
import { fs } from '@/utils/fs'
import { storage } from '@/utils/storage'

import { createNotification } from './notification'

export const restore = async () => {
	try {
		const n = createNotification({
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

		new Directory(Paths.document, 'files').create({
			intermediates: true,
			overwrite: false,
			idempotent: true,
		})

		let recordsArray: TRecord[] = []
		const records = driveFiles.data?.find(v => v.name === 'records.json')
		const recordsFile = new File(Paths.cache, 'records.json')
		if (records?.id) {
			n.update({ body: `Downloading records...` })
			await drive.download(records.id, recordsFile)
		}

		let patientsArray: TPatient[] = []
		const patients = driveFiles.data?.find(v => v.name === 'patients.json')
		const patientsFile = new File(Paths.cache, 'patients.json')
		if (patients?.id) {
			n.update({ body: `Downloading patients...` })
			await drive.download(patients.id, patientsFile)
		}

		let medicinesArray: TMedicine[] = []
		const medicines = driveFiles.data?.find(v => v.name === 'medicines.json')
		const medicinesFile = new File(Paths.cache, 'medicines.json')
		if (medicines?.id) {
			n.update({ body: `Downloading medicines...` })
			await drive.download(medicines.id, medicinesFile)
		}

		let patientMedicinesArray: TPatientMedicine[] = []
		const patientMedicines = driveFiles.data?.find(
			v => v.name === 'patient-medicines.json',
		)
		const patientMedicinesFile = new File(Paths.cache, 'patient-medicines.json')
		if (patientMedicines?.id) {
			n.update({ body: `Downloading patient medicines...` })
			await drive.download(patientMedicines.id, patientMedicinesFile)
		}

		try {
			const recordsData = await recordsFile.text()
			const records = JSON.parse(recordsData)
			if (Array.isArray(records)) {
				recordsArray = records.map(v => ({
					...v,
					attachments: (v.attachments || []).map((v: string) => {
						return new File(Paths.document, v).info()
					}),
				}))
			}
		} catch {}

		try {
			const patientsData = await patientsFile.text()
			const patients = JSON.parse(patientsData)
			if (Array.isArray(patients)) {
				patientsArray = patients.map(v => ({
					...v,
					avatar: v.avatar
						? new File(Paths.document, v.avatar).info()
						: undefined,
				}))
			}
		} catch {}

		try {
			const medicinesData = await medicinesFile.text()
			const medicines = JSON.parse(medicinesData)
			if (Array.isArray(medicines)) {
				medicinesArray = medicines.map(v => ({
					...v,
					thumbnail: v.thumbnail
						? new File(Paths.document, v.thumbnail).info()
						: undefined,
				}))
			}
		} catch {}

		try {
			const patientMedicinesData = await patientMedicinesFile.text()
			const patientMedicines = JSON.parse(patientMedicinesData)
			if (Array.isArray(patientMedicines)) {
				patientMedicinesArray = patientMedicines
			}
		} catch {}

		storage.set('records', JSON.stringify(recordsArray))
		storage.set('patients', JSON.stringify(patientsArray))
		storage.set('medicines', JSON.stringify(medicinesArray))
		storage.set('patient-medicines', JSON.stringify(patientMedicinesArray))

		const downloadFiles =
			driveFiles.data?.filter(v => {
				return (
					patientsArray.some(p => p.avatar?.uri!.split('/').pop() === v.name) ||
					medicinesArray.some(
						m => m.thumbnail?.uri!.split('/').pop() === v.name,
					) ||
					recordsArray.some(r =>
						r.attachments?.some(a => a.uri!.split('/').pop() === v.name),
					)
				)
			}) || []

		for (const file of downloadFiles) {
			const destination = new File(Paths.document, 'files', file.name)
			if (destination.exists) continue
			n.update({ body: `Downloading ${file.name}...` })
			await drive.download(file.id, destination)
		}

		const localFiles = fs.getFiles('files')
		const extraLocalFiles = localFiles.filter(localFile => {
			return !driveFiles.data?.some(driveFile => {
				return driveFile.name === localFile.uri.split('/').pop()
			})
		})
		fs.removeMany(extraLocalFiles.map(v => v.uri))

		n.update({
			title: `Success!`,
			body: `Data restored successfully`,
		})

		return {
			success: true,
			message: 'Data restored successfully',
		}
	} catch (error) {
		return {
			success: false,
			message: (error as any)?.message || 'Error restoring data',
		}
	}
}
