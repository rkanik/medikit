import type {
	attachables,
	attachments,
	medicines,
	patientMedicines,
	patients,
	records,
} from '@/drizzle/schema'
import type { TMaybe } from '@/types'
import type { File, FileInfo } from 'expo-file-system'
import type { ImagePickerAsset } from 'expo-image-picker'

export type TAsset = File | FileInfo | ImagePickerAsset

export type TAttachable = typeof attachables.$inferSelect & {
	record?: TMaybe<TRecord>
	patient?: TMaybe<TPatient>
	medicine?: TMaybe<TMedicine>
}

export type TAttachment = typeof attachments.$inferSelect & {
	attachables?: TMaybe<TAttachable[]>
}

export type TPatient = typeof patients.$inferSelect & {
	avatar?: TMaybe<TAttachment>
}

export type TRecord = typeof records.$inferSelect & {
	patient?: TMaybe<TPatient>
	attachables?: TMaybe<TAttachable[]>
}

export type TMedicine = typeof medicines.$inferSelect & {
	thumbnail?: TMaybe<TAttachment>
}

export type TPatientMedicine = typeof patientMedicines.$inferSelect & {
	patient?: TMaybe<TPatient>
	medicine?: TMaybe<TMedicine>
}
