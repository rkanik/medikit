import type {
	attachablesTable,
	attachmentsTable,
	medicinesTable,
	patientMedicinesTable,
	patientsTable,
	recordsTable,
} from '@/drizzle/schema'
import type { File, FileInfo } from 'expo-file-system'
import type { ImagePickerAsset } from 'expo-image-picker'

export type TAsset = File | FileInfo | ImagePickerAsset

export type TPatient = typeof patientsTable.$inferSelect & {
	avatar?: typeof attachmentsTable.$inferSelect
}

export type TRecord = typeof recordsTable.$inferSelect & {
	patient?: typeof patientsTable.$inferSelect
	attachables?: typeof attachablesTable.$inferSelect &
		{
			attachment?: typeof attachmentsTable.$inferSelect
		}[]
}

export type TMedicine = typeof medicinesTable.$inferSelect & {
	thumbnail?: typeof attachmentsTable.$inferSelect
}

export type TPatientMedicine = typeof patientMedicinesTable.$inferSelect & {
	patient?: typeof patientsTable.$inferSelect
	medicine?: typeof medicinesTable.$inferSelect
}
