import { FileInfo } from 'expo-file-system'
import { ImagePickerAsset } from 'expo-image-picker'

export type TPatient = {
	id: number
	name: string
	dob?: string
	avatar?: ImagePickerAsset | FileInfo
}
