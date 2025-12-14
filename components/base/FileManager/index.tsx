import { Button, ButtonIcon } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { fs } from '@/utils/fs'
import { log } from '@/utils/logs'
import { Directory, File } from 'expo-file-system'
import { Image } from 'expo-image'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

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
			log('Error loading directory:', error)
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
		<View className="flex-1">
			{/* Header with back button and path */}
			<View className="flex-row items-center gap-2 px-4 py-3 border-b border-outline-200">
				{canGoBack && (
					<Button variant="link" size="sm" onPress={handleBack} className="p-2">
						<ButtonIcon name="chevron-left" />
					</Button>
				)}
				<Text size="sm" className="flex-1">
					{pathDisplay}
				</Text>
			</View>

			{/* File list */}
			<ScrollView className="flex-1">
				{loading ? (
					<View className="p-4 items-center">
						<Text>Loading...</Text>
					</View>
				) : items.length === 0 ? (
					<View className="p-4 items-center">
						<Text size="sm" className="text-typography-500">
							No files or directories
						</Text>
					</View>
				) : (
					<View className="p-2">
						{items.map((item, index) => (
							<Pressable
								key={`${item.uri}-${index}`}
								onPress={() => handleItemPress(item)}
								className="flex-row items-center gap-3 p-3 rounded-lg active:bg-background-100 border-b border-outline-100"
							>
								<View className="items-center justify-center w-10 h-10">
									{item.isDirectory ? (
										<Icon name="folder" className="text-background-300" />
									) : item.uri.endsWith('.json') ? (
										<Icon name="file-json" className="text-background-300" />
									) : item.uri.endsWith('.apk') ? (
										<Icon name="package" className="text-background-300" />
									) : ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(
											item.uri.split('.').pop() ?? '',
									  ) ? (
										<Image
											source={{ uri: item.uri }}
											style={{ width: 24, height: 24 }}
										/>
									) : (
										<Icon name="file" className="text-background-300" />
									)}
								</View>
								<View className="flex-1 min-w-0">
									<Text size="sm" bold={item.isDirectory}>
										{item.name}
									</Text>
									{!item.isDirectory && item.size !== null && (
										<Text size="xs" className="text-typography-500">
											{fs.formatSize(item.size)}
										</Text>
									)}
								</View>
								{item.isDirectory && (
									<Icon name="chevron-right" className="text-background-300" />
								)}
							</Pressable>
						))}
					</View>
				)}
			</ScrollView>
		</View>
	)
}
