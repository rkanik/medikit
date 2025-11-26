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
	doctor?: TMaybe<string>
	amount?: TMaybe<number>
	hospital?: TMaybe<string>
	location?: TMaybe<string>
	description?: TMaybe<string>
	attachments?: TMaybe<FileInfo | ImagePickerAsset>[]
	createdAt?: TMaybe<string>
	updatedAt?: TMaybe<string>
}
