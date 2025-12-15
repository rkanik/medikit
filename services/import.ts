import { storage } from '@/utils/storage'
import { getDocumentAsync } from 'expo-document-picker'
import { Directory, File, Paths } from 'expo-file-system'
import { unzip } from 'react-native-zip-archive'

export const $import = async () => {
	try {
		const result = await getDocumentAsync({
			type: ['application/zip'],
			base64: false,
			multiple: false,
			copyToCacheDirectory: true,
		})

		if (!result.assets?.length) {
			return {
				success: false,
				message: 'No file selected',
			}
		}

		const importDirectory = new Directory(Paths.cache, 'import')
		if (importDirectory.exists) importDirectory.delete()
		importDirectory.create()

		await unzip(result.assets[0].uri, importDirectory.uri)

		const files = importDirectory.list()

		const filesDirectory = new Directory(Paths.document, 'files')
		if (!filesDirectory.exists) filesDirectory.create()

		for (const file of files) {
			if (file instanceof File) {
				if (file.uri.endsWith('.json')) {
					const data = await file.text()
					try {
						const array = JSON.parse(data)
						if (Array.isArray(array)) {
							if (file.uri.endsWith('records.json')) {
								storage.set(
									'records',
									JSON.stringify(
										array.map(v => ({
											...v,
											attachments: (v.attachments || []).map((v: any) => {
												return {
													uri: Paths.join(
														Paths.document,
														'files',
														v.uri.split('/').pop()!,
													),
												}
											}),
										})),
									),
								)
							} else if (file.uri.endsWith('patients.json')) {
								storage.set(
									'patients',
									JSON.stringify(
										array.map(v => ({
											...v,
											avatar: v.avatar?.uri
												? {
														uri: Paths.join(
															Paths.document,
															'files',
															v.avatar.uri.split('/').pop()!,
														),
													}
												: undefined,
										})),
									),
								)
							}
						}
					} catch (error) {
						console.log('Error parsing file...', file.uri, error)
					}
				} else {
					console.log('Copying file...', file.uri)
					const destination = new File(
						Paths.document,
						'files',
						file.uri.split('/').pop()!,
					)
					if (destination.exists) {
						destination.delete()
					}
					file.copy(destination)
				}
			}
		}

		importDirectory.delete()
		const cacheDirectory = new Directory(Paths.cache)
		if (cacheDirectory.exists) cacheDirectory.delete()

		//
		return {
			success: true,
			message: 'Data imported successfully',
		}
	} catch (error) {
		console.log('error', error)
		return {
			success: false,
			message: (error as any)?.message || 'Error importing data',
		}
	}
}
