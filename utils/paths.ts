import type { TMaybe } from '@/types'

import { Paths } from 'expo-file-system'

export const paths = {
	document<T extends TMaybe<string>>(uri: T) {
		if (!uri) return uri
		if (uri.startsWith(Paths.document.uri)) {
			return uri
		}
		if (['file://', 'content://'].some(v => uri.startsWith(v))) {
			return uri
		}
		return Paths.join(Paths.document, uri)
	},
	withoutDocument(uri?: TMaybe<string>) {
		if (uri?.startsWith(Paths.document.uri)) {
			return uri.replace(Paths.document.uri, '')
		}
		return uri
	},
}
