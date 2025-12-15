import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Pressable } from '@/components/ui/pressable'
import { Subtitle, Text, Title } from '@/components/ui/text'
import { fs } from '@/utils/fs'
import { FlashList } from '@shopify/flash-list'
import { Directory, File } from 'expo-file-system'
import { Image } from 'expo-image'
import { startActivityAsync } from 'expo-intent-launcher'
import { useCallback, useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { cn } from 'tailwind-variants'

const extensionIcons: Record<string, string> = {
	'.jpg': 'image',
	'.jpeg': 'image',
	'.png': 'image',
	'.gif': 'image',
	'.webp': 'image',
	'.svg': 'image',
	'.json': 'code',
	'.apk': 'package',
}

type TListItemProps = {
	uri?: string
	icon?: string
	title: string
	subtitle?: string
	className?: string
	onPress?: () => void
}
const ListItem = ({
	uri,
	title,
	subtitle,
	className,
	icon = 'file',
	onPress,
}: TListItemProps) => {
	return (
		<Pressable
			onPress={onPress}
			className={cn(
				'flex-row items-center py-3 pr-4 rounded-lg bg-white dark:bg-neutral-800 overflow-hidden',
				className,
			)}
		>
			<View className="w-16 flex items-center justify-center flex-none">
				{icon ? (
					icon === 'image' ? (
						<Image
							source={{ uri }}
							style={{
								width: 36,
								height: 36,
								borderRadius: 4,
							}}
						/>
					) : (
						<Icon name={icon} className="text-2xl" />
					)
				) : null}
			</View>
			<View className="flex-1">
				<Title numberOfLines={1}>{title}</Title>
				{subtitle && <Subtitle>{subtitle}</Subtitle>}
			</View>
		</Pressable>
	)
}

type FileManagerProps = {
	initialPath?: string | string[]
}

export const FileManager = ({ initialPath }: FileManagerProps) => {
	const [currentPath, setCurrentPath] = useState<string[]>(
		initialPath
			? typeof initialPath === 'string'
				? [initialPath]
				: initialPath
			: [],
	)
	const [loading, setLoading] = useState(false)

	const [files, setFiles] = useState<File[]>([])
	const [directories, setDirectories] = useState<Directory[]>([])

	const loadDirectory = useCallback(async (path: string[]) => {
		setLoading(true)
		try {
			const directoryItems = fs.list(path)

			const files = directoryItems.filter(v => v instanceof File)
			setFiles(files)

			const directories = directoryItems.filter(v => v instanceof Directory)
			setDirectories(directories)
		} catch {
			setFiles([])
			setDirectories([])
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadDirectory(currentPath)
	}, [currentPath, loadDirectory])

	const onPressItem = useCallback(
		(item: File | Directory) => {
			if (item instanceof Directory) {
				const newPath = [...currentPath, item.name]
				return setCurrentPath(newPath)
			}
			startActivityAsync('android.intent.action.VIEW', {
				data: item.contentUri,
				type: item.type,
				flags: 1,
			})
		},
		[currentPath],
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
					<Button size="sm" icon="chevron-left" onPress={handleBack} />
				)}
				<Text className="flex-1">{pathDisplay}</Text>
			</View>

			{/* File list */}
			<ScrollView className="flex-1">
				{loading ? (
					<View className="p-4 items-center">
						<Text>Loading...</Text>
					</View>
				) : directories.length + files.length === 0 ? (
					<View className="p-4 items-center">
						<Text className="text-typography-500">No files or directories</Text>
					</View>
				) : (
					<View className="p-2">
						<View className="gap-4">
							{directories.length > 0 && (
								<View>
									<View className="pl-4 mb-1">
										<Title>Folders</Title>
									</View>
									<FlashList
										data={directories}
										contentContainerStyle={{
											borderRadius: 16,
											overflow: 'hidden',
										}}
										renderItem={({ item, index }) => (
											<ListItem
												key={index}
												icon="folder"
												title={item.name}
												subtitle={fs.formatSize(item.size)}
												className={cn({ 'mt-1': index > 0 })}
												onPress={() => onPressItem(item)}
											/>
										)}
									/>
								</View>
							)}
							{files.length > 0 && (
								<View>
									<View className="pl-4 mb-1">
										<Title>Files</Title>
									</View>
									<FlashList
										data={files}
										contentContainerStyle={{
											borderRadius: 16,
											overflow: 'hidden',
										}}
										renderItem={({ item, index }) => (
											<ListItem
												key={index}
												uri={item.uri}
												icon={extensionIcons[item.extension]}
												title={item.name}
												subtitle={fs.formatSize(item.size)}
												className={cn({ 'mt-1': index > 0 })}
												onPress={() => onPressItem(item)}
											/>
										)}
									/>
								</View>
							)}
						</View>
					</View>
				)}
			</ScrollView>
		</View>
	)
}
