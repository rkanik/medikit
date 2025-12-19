import type { TMaybe } from '@/types'
import type { File, FileInfo } from 'expo-file-system'
import type { ImagePickerAsset } from 'expo-image-picker'

export type TAsset = File | FileInfo | ImagePickerAsset

export type TPatient = {
	id: number
	name: string
	dob?: TMaybe<string>
	avatar?: TMaybe<TAsset>
	createdAt?: TMaybe<string>
	updatedAt?: TMaybe<string>
}

export type TRecord = {
	id: number
	// type: string
	text: string
	date: string
	amount: number
	patientId: number
	attachments: TAsset[]
	createdAt: string
	updatedAt: string
	tags?: string[]
}
