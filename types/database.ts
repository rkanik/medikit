import type {
	attachables,
	attachments,
	medicines,
	patientMedicines,
	patients,
	records,
} from '@/drizzle/schema'
import type { File, FileInfo } from 'expo-file-system'
import type { ImagePickerAsset } from 'expo-image-picker'

export type TAsset = File | FileInfo | ImagePickerAsset

export type TAttachment = typeof attachments.$inferSelect & {
	attachables?: typeof attachables.$inferSelect &
		{
			record?: typeof records.$inferSelect
			patient?: typeof patients.$inferSelect
			medicine?: typeof medicines.$inferSelect
		}[]
}

export type TPatient = typeof patients.$inferSelect & {
	avatar?: typeof attachments.$inferSelect | null
}

export type TRecord = typeof records.$inferSelect & {
	patient?: typeof patients.$inferSelect
	attachables?: typeof attachables.$inferSelect &
		{
			attachment?: typeof attachments.$inferSelect
		}[]
}

export type TMedicine = typeof medicines.$inferSelect & {
	thumbnail?: typeof attachments.$inferSelect
}

export type TPatientMedicine = typeof patientMedicines.$inferSelect & {
	patient?: typeof patients.$inferSelect
	medicine?: typeof medicines.$inferSelect
}
