import type { TMaybe } from '@/types'

import { File, Paths } from 'expo-file-system'

export const paths = {
	document<T extends TMaybe<string>>(uri: T) {
		if (!uri) return uri
		if (uri.startsWith(Paths.document.uri)) {
			return uri
		}
		if (['file://', 'content://'].some(v => uri.startsWith(v))) {
			return uri
		}
		const parts = uri.split('/').filter(Boolean)
		return new File(Paths.document, ...parts).uri
	},
	withoutDocument(uri?: TMaybe<string>) {
		if (uri?.startsWith(Paths.document.uri)) {
			return uri.replace(Paths.document.uri, '')
		}
		return uri
	},
}
