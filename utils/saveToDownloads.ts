import { Platform } from 'react-native'
import { Directory, File, Paths } from 'expo-file-system'
import mime from 'mime/lite'
import ReactNativeBlobUtil from 'react-native-blob-util'
import { storage } from '@/utils/storage'

const ANDROID_DOWNLOAD_FOLDER = 'Medikit'
const DOWNLOADS_REGISTRY_KEY = 'downloadedFiles'

export type TSaveToDownloadsResult = {
	path: string
	skipped: boolean
}

const getFileName = (uri: string) => {
	const name = uri.split('/').pop()?.split('?')[0]
	return name || `medikit-${Date.now()}.jpg`
}

const getDownloadKey = (fileName: string) => {
	if (Platform.OS === 'android') {
		return `${ANDROID_DOWNLOAD_FOLDER}/${fileName}`
	}
	return `Downloads/${fileName}`
}

const getDownloadRegistry = () => storage.getArray<string>(DOWNLOADS_REGISTRY_KEY)

const markAsDownloaded = (fileName: string) => {
	const key = getDownloadKey(fileName)
	const registry = getDownloadRegistry()
	if (registry.includes(key)) return
	storage.set(DOWNLOADS_REGISTRY_KEY, JSON.stringify([...registry, key]))
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

const isAndroidFileDownloaded = async (fileName: string) => {
	const path = getAndroidDownloadPath(fileName)
	if (await ReactNativeBlobUtil.fs.exists(path)) {
		return true
	}

	if (Number(Platform.Version) < 29) {
		return false
	}

	try {
		const folder = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${ANDROID_DOWNLOAD_FOLDER}`
		const files = await ReactNativeBlobUtil.fs.ls(folder)
		return files.includes(fileName)
	} catch {
		return false
	}
}

const isAlreadyDownloaded = async (fileName: string) => {
	if (getDownloadRegistry().includes(getDownloadKey(fileName))) {
		return true
	}

	if (Platform.OS === 'android') {
		if (await isAndroidFileDownloaded(fileName)) {
			markAsDownloaded(fileName)
			return true
		}
		return false
	}

	const destination = new File(new Directory(Paths.document, 'Downloads'), fileName)
	if (destination.exists) {
		markAsDownloaded(fileName)
		return true
	}
	return false
}

const saveToAndroidDownloads = async (
	uri: string,
): Promise<TSaveToDownloadsResult> => {
	const baseName = getFileName(uri)
	const mimeType = mime.getType(uri) || 'image/jpeg'
	const sourcePath = resolveSourceFile(uri)
	const existingPath = getAndroidDownloadPath(baseName)

	if (await isAlreadyDownloaded(baseName)) {
		return { path: existingPath, skipped: true }
	}

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
		markAsDownloaded(baseName)
		return { path, skipped: false }
	}

	await ReactNativeBlobUtil.fs.cp(sourcePath, existingPath)
	await ReactNativeBlobUtil.fs.scanFile([
		{ path: existingPath, mime: mimeType },
	])
	markAsDownloaded(baseName)
	return { path: existingPath, skipped: false }
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

	if (await isAlreadyDownloaded(baseName)) {
		return { path: destination.uri, skipped: true }
	}

	const source =
		uri.startsWith('file://') || uri.startsWith('content://')
			? new File(uri)
			: new File(Paths.document, ...uri.split('/').filter(Boolean))
	if (!source.exists) {
		throw new Error('Source file not found')
	}
	source.copy(destination)
	markAsDownloaded(baseName)
	return { path: destination.uri, skipped: false }
}
