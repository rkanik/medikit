import type { TMaybe } from '@/types'

import { File, Paths } from 'expo-file-system'

const hasScheme = (uri: string) =>
	/^(file|content|http|https|ph|assets-library):/i.test(uri)

export const paths = {
	document<T extends TMaybe<string>>(uri: T) {
		if (!uri) return uri
		if (uri.startsWith(Paths.document.uri) || hasScheme(uri)) {
			return uri
		}
		// Absolute path without scheme
		if (uri.startsWith('/')) {
			return uri
		}
		const parts = uri.split(/[/\\]/).filter(Boolean)
		return new File(Paths.document, ...parts).uri
	},
	withoutDocument(uri?: TMaybe<string>) {
		if (uri?.startsWith(Paths.document.uri)) {
			return uri.replace(Paths.document.uri, '')
		}
		return uri
	},
}
