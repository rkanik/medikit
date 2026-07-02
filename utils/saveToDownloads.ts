import { Platform } from 'react-native'
import { Directory, File, Paths } from 'expo-file-system'
import mime from 'mime/lite'
import ReactNativeBlobUtil from 'react-native-blob-util'

const ANDROID_DOWNLOAD_FOLDER = 'Medikit'

export type TSaveToDownloadsResult = {
	path: string
}

const getFileName = (uri: string) => {
	const name = uri.split('/').pop()?.split('?')[0]
	return name || `medikit-${Date.now()}.jpg`
}

const toNativePath = (uri: string) => {
	if (uri.startsWith('file://')) {
		return uri.replace('file://', '')
	}
	return uri
}

const resolveSourceFile = (uri: string) => {
	if (uri.startsWith('file://') || uri.startsWith('content://')) {
		const file = new File(uri)
		if (!file.exists) {
			throw new Error('Source file not found')
		}
		return toNativePath(file.uri)
	}

	const file = new File(Paths.document, ...uri.split('/').filter(Boolean))
	if (!file.exists) {
		throw new Error('Source file not found')
	}
	return toNativePath(file.uri)
}

const getAndroidDownloadPath = (fileName: string) => {
	const downloadDir =
		Number(Platform.Version) >= 29
			? ReactNativeBlobUtil.fs.dirs.DownloadDir
			: ReactNativeBlobUtil.fs.dirs.LegacyDownloadDir ||
				ReactNativeBlobUtil.fs.dirs.DownloadDir

	if (Number(Platform.Version) >= 29) {
		return `${downloadDir}/${ANDROID_DOWNLOAD_FOLDER}/${fileName}`
	}

	return `${downloadDir}/${fileName}`
}

const saveToAndroidDownloads = async (
	uri: string,
): Promise<TSaveToDownloadsResult> => {
	const baseName = getFileName(uri)
	const mimeType = mime.getType(uri) || 'image/jpeg'
	const sourcePath = resolveSourceFile(uri)
	const existingPath = getAndroidDownloadPath(baseName)

	if (Number(Platform.Version) >= 29) {
		const path = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
			{
				name: baseName,
				parentFolder: ANDROID_DOWNLOAD_FOLDER,
				mimeType,
			},
			'Download',
			sourcePath,
		)
		return { path }
	}

	await ReactNativeBlobUtil.fs.cp(sourcePath, existingPath)
	await ReactNativeBlobUtil.fs.scanFile([
		{ path: existingPath, mime: mimeType },
	])
	return { path: existingPath }
}

export const saveToDownloads = async (
	uri: string,
): Promise<TSaveToDownloadsResult> => {
	if (Platform.OS === 'android') {
		return saveToAndroidDownloads(uri)
	}

	const baseName = getFileName(uri)
	const directory = new Directory(Paths.document, 'Downloads')
	directory.create({ idempotent: true, intermediates: true })
	const destination = new File(directory, baseName)

	const source =
		uri.startsWith('file://') || uri.startsWith('content://')
			? new File(uri)
			: new File(Paths.document, ...uri.split('/').filter(Boolean))
	if (!source.exists) {
		throw new Error('Source file not found')
	}
	source.copy(destination)
	return { path: destination.uri }
}
