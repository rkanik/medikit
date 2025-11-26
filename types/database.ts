import { FileInfo } from 'expo-file-system'
import { ImagePickerAsset } from 'expo-image-picker'
import { TMaybe } from '.'

export type TPatient = {
	id: number
	name: string
	dob?: TMaybe<string>
	avatar?: TMaybe<FileInfo | ImagePickerAsset>
	createdAt?: TMaybe<string>
	updatedAt?: TMaybe<string>
}

export type TRecord = {
	id: number
	patientId: number
	type: string
	title: string
	date?: TMaybe<string>
	description?: TMaybe<string>
	doctor?: TMaybe<string>
	hospital?: TMaybe<string>
	location?: TMaybe<string>
	amount?: TMaybe<number>
	attachments?: TMaybe<FileInfo | ImagePickerAsset>[]
	createdAt?: TMaybe<string>
	updatedAt?: TMaybe<string>
}
