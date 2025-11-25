import { FileInfo } from 'expo-file-system'
import { ImagePickerAsset } from 'expo-image-picker'
import { TMaybe } from '.'

export type TPatient = {
	id: number
	name: string
	dob?: TMaybe<string>
	avatar?: TMaybe<FileInfo | ImagePickerAsset>
}
