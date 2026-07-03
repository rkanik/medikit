import { requireNativeModule } from 'expo-modules-core'

type TMedikitShareModule = {
	shareFiles(uris: string[], mimeType?: string): Promise<void>
}

const MedikitShare = requireNativeModule<TMedikitShareModule>('MedikitShare')

export const shareFilesNative = (uris: string[], mimeType?: string) => {
	return MedikitShare.shareFiles(uris, mimeType)
}
