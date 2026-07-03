import { Platform } from 'react-native'
import { Directory, File, Paths } from 'expo-file-system'
import { shareAsync } from 'expo-sharing'
import mime from 'mime/lite'
import { zip } from 'react-native-zip-archive'
import { shareFilesNative } from 'medikit-share'
import { paths } from '@/utils/paths'

const resolveFile = (uri: string) => {
	const file = new File(paths.document(uri)!)
	if (!file.exists) {
		throw new Error('File not found')
	}
	return file
}

const getShareMimeType = (files: File[]) => {
	const types = files.map(file => file.type || mime.getType(file.uri) || '')
	if (types.every(type => type.startsWith('image/'))) {
		return 'image/*'
	}
	return '*/*'
}

const shareAsZip = async (files: File[]) => {
	const shareDir = new Directory(Paths.cache, 'share')
	if (shareDir.exists) {
		shareDir.delete()
	}
	shareDir.create()

	files.forEach((file, index) => {
		file.copy(new File(shareDir, `${index}-${file.name}`))
	})

	const zipFile = new File(Paths.cache, `share-${Date.now()}.zip`)
	await zip(shareDir.uri, zipFile.uri)
	await shareAsync(zipFile.uri)

	shareDir.delete()
	if (zipFile.exists) {
		zipFile.delete()
	}
}

export const shareFiles = async (uris: string[]) => {
	const files = uris.map(resolveFile)
	if (!files.length) return

	if (files.length === 1) {
		await shareAsync(files[0].uri)
		return
	}

	if (Platform.OS === 'android') {
		try {
			await shareFilesNative(
				files.map(file => file.contentUri),
				getShareMimeType(files),
			)
			return
		} catch {
			await shareAsZip(files)
			return
		}
	}

	await shareAsZip(files)
}
