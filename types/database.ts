import type {
	attachables,
	attachments,
	medicines,
	patientMedicines,
	patientPregnancies,
	patients,
	patientTimelineEntries,
	patientTimelineValues,
	pregnancyChildren,
	records,
	taggablesTable,
	tags,
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

export type TTag = typeof tags.$inferSelect

export type TTaggable = typeof taggablesTable.$inferSelect & {
	tag?: TMaybe<TTag>
}

export type TRecord = typeof records.$inferSelect & {
	patient?: TMaybe<TPatient>
	attachables?: TMaybe<TAttachable[]>
	taggables?: TMaybe<TTaggable[]>
	tags?: string[]
	attachments?: TMaybe<TAttachment[]>
}

export type TMedicine = typeof medicines.$inferSelect & {
	thumbnail?: TMaybe<TAttachment>
}

export type TPatientMedicine = typeof patientMedicines.$inferSelect & {
	patient?: TMaybe<TPatient>
	medicine?: TMaybe<TMedicine>
}

export type TPatientTimelineValue = typeof patientTimelineValues.$inferSelect

export type TPatientTimelineEntry = typeof patientTimelineEntries.$inferSelect & {
	patient?: TMaybe<TPatient>
	values?: TPatientTimelineValue[]
}

export type TPregnancyChild = typeof pregnancyChildren.$inferSelect & {
	child?: TMaybe<TPatient>
}

export type TPatientPregnancy = typeof patientPregnancies.$inferSelect & {
	patient?: TMaybe<TPatient>
	father?: TMaybe<TPatient>
	children?: TPregnancyChild[]
}
