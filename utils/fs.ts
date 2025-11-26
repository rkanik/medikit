import {
	Directory,
	DirectoryCreateOptions,
	File,
	FileInfo,
	Paths,
} from 'expo-file-system'
import { ImagePickerAsset } from 'expo-image-picker'

/**
 * Get a directory instance for the given path
 */
const getDirectory = (path?: string | string[]): Directory => {
	if (!path) {
		return new Directory(Paths.document)
	}
	if (typeof path === 'string') {
		return new Directory(Paths.document, path)
	}
	return new Directory(Paths.document, ...path)
}

/**
 * List all files and directories in the given directory
 */
const list = (path?: string | string[]): (File | Directory)[] => {
	try {
		const directory = getDirectory(path)
		if (!directory.exists) {
			return []
		}
		return directory.list()
	} catch (error) {
		console.error('Error listing directory:', error)
		return []
	}
}

const getFiles = (path?: string | string[]): File[] => {
	return list(path).filter(item => item instanceof File)
}

/**
 * Get info about a file or directory
 */
const getInfo = async (
	item: File | Directory,
): Promise<{
	name: string
	isDirectory: boolean
	size: number | null
	uri: string
	exists: boolean
}> => {
	try {
		const info = item.info()
		return {
			name: item.name,
			isDirectory: item instanceof Directory,
			size: info.size ?? null,
			uri: item.uri,
			exists: info.exists,
		}
	} catch (error) {
		console.error('Error getting info:', error)
		return {
			name: item.name,
			isDirectory: item instanceof Directory,
			size: null,
			uri: item.uri,
			exists: false,
		}
	}
}

/**
 * Check if an item is a directory
 */
const isDirectory = (item: File | Directory): boolean => {
	return item instanceof Directory
}

/**
 * Check if an item is a file
 */
const isFile = (item: File | Directory): boolean => {
	return item instanceof File
}

/**
 * Format file size in bytes to human readable format
 */
const formatSize = (bytes: number | null): string => {
	if (bytes === null || bytes === undefined) {
		return 'Unknown'
	}
	if (bytes === 0) {
		return '0 B'
	}
	const k = 1024
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Get the document directory path
 */
const getDocumentPath = (): string => {
	return Paths.document.uri
}

/**
 * Create a directory at the given path
 */
const createDirectory = (
	path: string | string[],
	options?: DirectoryCreateOptions,
): Directory => {
	const directory = getDirectory(path)
	directory.create({
		overwrite: options?.overwrite ?? false,
		idempotent: options?.idempotent ?? true,
		intermediates: options?.intermediates ?? true,
	})
	return directory
}

/**
 * Delete a file or directory
 */
const deleteItem = (item: File | Directory): void => {
	try {
		item.delete()
	} catch (error) {
		console.error('Error deleting item:', error)
		throw error
	}
}

const copyAssetTo = (path: string, asset: ImagePickerAsset | FileInfo) => {
	try {
		if (!asset.uri) {
			return {
				error: 'Asset URI is required',
			}
		}
		createDirectory(path)
		const destinationFile = new File(
			Paths.join(Paths.document, path, asset.uri.split('/').pop()!),
		)
		if (asset.uri === destinationFile.uri) {
			return {
				data: destinationFile.info(),
			}
		}
		const sourceFile = new File(asset.uri)
		sourceFile.copy(destinationFile)
		return {
			data: destinationFile.info(),
		}
	} catch (error) {
		return { error }
	}
}

const remove = (path: string) => {
	try {
		const file = new File(path)
		file.delete()
		return {
			error: null,
		}
	} catch (error: any) {
		return {
			error,
		}
	}
}

const createJsonFile = (object: object, name: string) => {
	const file = new File(Paths.join(Paths.cache, name))
	file.write(JSON.stringify(object))
	return file.info()
}

export const fs = {
	getDirectory,
	list,
	getFiles,
	getInfo,
	isDirectory,
	isFile,
	formatSize,
	getDocumentPath,
	createDirectory,
	deleteItem,
	copyAssetTo,
	remove,
	createJsonFile,
}
