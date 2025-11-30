import { Button, ButtonIcon } from '@/components/ui/button'
import { Image } from 'expo-image'
import {
	CameraIcon,
	FolderIcon,
	ImageIcon,
	PlusIcon,
	XIcon,
} from 'lucide-react-native'
import type { Ref } from 'react'
import { forwardRef, useCallback } from 'react'
import type { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'
import { Keyboard, Pressable, View } from 'react-native'
import { BaseController, TBaseControllerProps } from '../controller'

import { Grid, GridItem } from '@/components/ui/grid'
import { Icon } from '@/components/ui/icon'
import { useImageViewer } from '@/context/ImageViewerProvider'
import { launchScanner } from '@dariyd/react-native-document-scanner'
import { getDocumentAsync } from 'expo-document-picker'
import { File } from 'expo-file-system'

import {
	ImagePickerOptions,
	launchImageLibraryAsync,
	useMediaLibraryPermissions,
} from 'expo-image-picker'
import { convert as convertPdfToImage } from 'react-native-pdf-to-image'
import { BaseDialog } from '../BaseDialog'

type TProps<T extends FieldValues> = TBaseControllerProps<T> & {
	options?: ImagePickerOptions
}

const BaseImagePickerInner = <T extends FieldValues>(
	props: TProps<T>,
	ref: Ref<any>,
) => {
	const [permission, request] = useMediaLibraryPermissions()
	const allowsMultipleSelection = props.options?.allowsMultipleSelection
	const { openImageViewer } = useImageViewer()

	const toAssetArray = useCallback((value: any) => {
		if (!value) {
			return []
		}
		if (Array.isArray(value)) {
			return value
		}
		return [value]
	}, [])

	const onPressImage = useCallback(
		async (field: ControllerRenderProps<T, Path<T>>) => {
			if (permission?.status !== 'granted') {
				const permissionResponse = await request()
				if (permissionResponse.status !== 'granted') {
					return
				}
			}
			const result = await launchImageLibraryAsync({
				...props.options,
				orderedSelection: true,
			})
			if (result.canceled) {
				return
			}
			if (!allowsMultipleSelection) {
				field.onChange(result.assets[0])
			} else {
				const assets = toAssetArray(field.value)
				console.log('assets', assets.length)
				field.onChange(
					assets.concat(
						result.assets.filter(asset => {
							return !assets.some(v => {
								return v.fileName === asset.fileName
							})
						}),
					),
				)
			}
		},
		[permission, request, props.options, allowsMultipleSelection, toAssetArray],
	)

	const onPressFolder = useCallback(
		async (field: ControllerRenderProps<T, Path<T>>) => {
			const result = await getDocumentAsync({
				type: 'application/pdf',
				multiple: true,
			})
			if (result.canceled) {
				return
			}
			const images: any[] = []
			for (const asset of result.assets) {
				const { outputFiles } = await convertPdfToImage(asset.uri)
				if (outputFiles?.length) {
					for (const outputFile of outputFiles) {
						const file = new File(outputFile)
						const fileInfo = file.info()
						if (fileInfo.exists) {
							images.push(fileInfo)
						}
					}
				}
			}
			const assets = toAssetArray(field.value)
			field.onChange(assets.concat(images))
		},
		[toAssetArray],
	)

	const onPressCamera = useCallback(
		async (field: ControllerRenderProps<T, Path<T>>) => {
			const result = await launchScanner({
				quality: 1,
				includeBase64: false,
			})
			if (result.images?.length) {
				field.onChange([...toAssetArray(field.value), ...result.images])
			}
		},
		[toAssetArray],
	)

	const handleRemove = useCallback(
		(field: ControllerRenderProps<T, Path<T>>, index: number) => {
			if (allowsMultipleSelection) {
				const current = Array.isArray(field.value) ? [...field.value] : []
				const next = current.filter((_, idx) => idx !== index)
				field.onChange(next)
				return
			}
			field.onChange(null)
		},
		[allowsMultipleSelection],
	)

	return (
		<BaseController
			{...props}
			render={v => {
				const assets = toAssetArray(v.field.value)
				return (
					<View className="gap-4">
						<Grid className="gap-4" _extra={{ className: 'grid-cols-3' }}>
							{assets.map((asset, index) => (
								<GridItem key={index} _extra={{ className: 'col-span-1' }}>
									<Pressable
										className="relative rounded overflow-hidden border border-background-300"
										onPress={() => {
											if (allowsMultipleSelection) {
												openImageViewer(assets, index)
												return
											}
											onPressImage(v.field)
										}}
									>
										<Image
											source={{ uri: asset?.uri }}
											style={{ width: '100%', aspectRatio: 1 }}
											contentFit="cover"
											contentPosition="center"
										/>
										<Pressable
											onPress={() => handleRemove(v.field, index)}
											className="absolute right-1 top-1 rounded-full bg-black/70 p-1"
											hitSlop={8}
										>
											<XIcon size={14} color="#fff" />
										</Pressable>
									</Pressable>
								</GridItem>
							))}
							{(allowsMultipleSelection ||
								(!allowsMultipleSelection && !assets.length)) && (
								<GridItem
									_extra={{ className: 'col-span-1' }}
									className="aspect-square"
								>
									<BaseDialog
										height={180}
										trigger={({ onPress }) => (
											<Button
												variant="outline"
												className="border-background-300 h-full"
												onPress={() => {
													Keyboard.dismiss()
													onPress()
												}}
											>
												<ButtonIcon as={PlusIcon} size="lg" />
											</Button>
										)}
									>
										<View className="flex-1 items-center flex-row gap-4 justify-center px-4 pb-4">
											<Button
												variant="outline"
												className="h-20 w-20 rounded-full"
												onPress={() => onPressFolder(v.field)}
											>
												<Icon as={FolderIcon} size="2xl" />
											</Button>
											<Button
												variant="outline"
												className="h-20 w-20 rounded-full"
												onPress={() => onPressImage(v.field)}
											>
												<Icon as={ImageIcon} size="2xl" />
											</Button>
											<Button
												variant="outline"
												className="h-20 w-20 rounded-full"
												onPress={() => onPressCamera(v.field)}
											>
												<Icon as={CameraIcon} size="2xl" />
											</Button>
										</View>
									</BaseDialog>
								</GridItem>
							)}
						</Grid>
					</View>
				)
			}}
		/>
	)
}

export const BaseImagePicker = forwardRef(BaseImagePickerInner) as <
	T extends FieldValues,
>(
	props: TProps<T> & { ref?: Ref<any> },
) => ReturnType<typeof BaseImagePickerInner>
