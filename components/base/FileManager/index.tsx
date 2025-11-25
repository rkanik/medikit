import { Box } from '@/components/ui/box'
import { Button, ButtonIcon } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { fs } from '@/utils/fs'
import { Directory, File } from 'expo-file-system'
import {
	ArrowLeftIcon,
	ChevronRightIcon,
	FileIcon,
	FolderIcon,
} from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView } from 'react-native'

type FileItem = {
	name: string
	isDirectory: boolean
	size: number | null
	uri: string
	exists: boolean
}

type FileManagerProps = {
	initialPath?: string | string[]
	onFileSelect?: (file: File) => void
	onDirectorySelect?: (directory: Directory) => void
}

export const FileManager = ({
	initialPath,
	onFileSelect,
	onDirectorySelect,
}: FileManagerProps) => {
	const [currentPath, setCurrentPath] = useState<string[]>(
		initialPath
			? typeof initialPath === 'string'
				? [initialPath]
				: initialPath
			: [],
	)
	const [items, setItems] = useState<FileItem[]>([])
	const [loading, setLoading] = useState(false)

	const loadDirectory = useCallback(async (path: string[]) => {
		setLoading(true)
		try {
			const directoryItems = fs.list(path)
			const itemsWithInfo = await Promise.all(
				directoryItems.map(item => fs.getInfo(item)),
			)
			// Sort: directories first, then files, both alphabetically
			const sorted = itemsWithInfo.sort((a, b) => {
				if (a.isDirectory && !b.isDirectory) return -1
				if (!a.isDirectory && b.isDirectory) return 1
				return a.name.localeCompare(b.name)
			})
			setItems(sorted)
		} catch (error) {
			console.error('Error loading directory:', error)
			setItems([])
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadDirectory(currentPath)
	}, [currentPath, loadDirectory])

	const handleItemPress = useCallback(
		async (item: FileItem) => {
			if (item.isDirectory) {
				const newPath = [...currentPath, item.name]
				setCurrentPath(newPath)
				if (onDirectorySelect) {
					const directory = fs.getDirectory(newPath)
					onDirectorySelect(directory)
				}
			} else {
				if (onFileSelect) {
					const file = new File(fs.getDirectory(currentPath), item.name)
					onFileSelect(file)
				}
			}
		},
		[currentPath, onFileSelect, onDirectorySelect],
	)

	const handleBack = useCallback(() => {
		if (currentPath.length > 0) {
			setCurrentPath(currentPath.slice(0, -1))
		}
	}, [currentPath])

	const canGoBack = currentPath.length > 0
	const pathDisplay =
		currentPath.length === 0 ? 'Documents' : currentPath.join(' / ')

	return (
		<Box className="flex-1">
			{/* Header with back button and path */}
			<Box className="flex-row items-center gap-2 px-4 py-3 border-b border-outline-200">
				{canGoBack && (
					<Button variant="link" size="sm" onPress={handleBack} className="p-2">
						<ButtonIcon as={ArrowLeftIcon} size="sm" />
					</Button>
				)}
				<Text size="sm" className="flex-1" isTruncated numberOfLines={1}>
					{pathDisplay}
				</Text>
			</Box>

			{/* File list */}
			<ScrollView className="flex-1">
				{loading ? (
					<Box className="p-4 items-center">
						<Text>Loading...</Text>
					</Box>
				) : items.length === 0 ? (
					<Box className="p-4 items-center">
						<Text size="sm" className="text-typography-500">
							No files or directories
						</Text>
					</Box>
				) : (
					<Box className="p-2">
						{items.map((item, index) => (
							<Pressable
								key={`${item.uri}-${index}`}
								onPress={() => handleItemPress(item)}
								className="flex-row items-center gap-3 p-3 rounded-lg active:bg-background-100 border-b border-outline-100"
							>
								<Box className="items-center justify-center w-10 h-10">
									{item.isDirectory ? (
										<FolderIcon size={24} color="#6B7280" fill="#E5E7EB" />
									) : (
										<FileIcon size={24} color="#6B7280" />
									)}
								</Box>
								<Box className="flex-1 min-w-0">
									<Text
										size="sm"
										bold={item.isDirectory}
										isTruncated
										numberOfLines={1}
									>
										{item.name}
									</Text>
									{!item.isDirectory && item.size !== null && (
										<Text size="xs" className="text-typography-500">
											{fs.formatSize(item.size)}
										</Text>
									)}
								</Box>
								{item.isDirectory && (
									<ChevronRightIcon size={20} color="#9CA3AF" />
								)}
							</Pressable>
						))}
					</Box>
				)}
			</ScrollView>
		</Box>
	)
}
