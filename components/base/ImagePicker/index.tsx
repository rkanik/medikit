import { Button, ButtonIcon } from '@/components/ui/button'
import { Image } from 'expo-image'
import type { Ref } from 'react'
import {
	forwardRef,
	Fragment,
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'react'
import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
	Path,
} from 'react-hook-form'
import { Keyboard, Pressable, View } from 'react-native'
import { BaseController, TBaseControllerProps } from '../controller'

import { Grid, GridItem } from '@/components/ui/grid'
import { useImageViewer } from '@/context/ImageViewerProvider'
import { launchScanner } from '@dariyd/react-native-document-scanner'
import { getDocumentAsync } from 'expo-document-picker'
import { File } from 'expo-file-system'

import { Icon } from '@/components/ui/icon'
import {
	ImagePickerOptions,
	launchCameraAsync,
	launchImageLibraryAsync,
} from 'expo-image-picker'
import { convert as convertPdfToImage } from 'react-native-pdf-to-image'
import { BaseDialog } from '../dialog'

type TBaseImagePickerProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<TBaseControllerProps<TFieldValues, TName>, 'render'> & {
	options?: ImagePickerOptions
	scanner?: boolean
	multiple?: boolean
	aspect?: [number, number]
}

const BaseImagePickerInner = <T extends FieldValues>(
	{ aspect, multiple, scanner, ...props }: TBaseImagePickerProps<T>,
	ref: Ref<any>,
) => {
	const { openImageViewer } = useImageViewer()

	type TField = ControllerRenderProps<T, Path<T>>
	const fieldRef = useRef<TField>(null)

	const options: ImagePickerOptions = useMemo(
		() => ({
			aspect,
			mediaTypes: ['images'],
			allowsEditing: aspect ? true : false,
			allowsMultipleSelection: multiple,
		}),
		[aspect, multiple],
	)

	const getValue = useCallback((value: any) => {
		if (!value) return []
		return Array.isArray(value) ? value : [value]
	}, [])

	const setValue = useCallback(
		(value?: any[] | null) => {
			if (!fieldRef.current) return
			if (!value?.length) return

			setVisible(false)
			if (!multiple) {
				fieldRef.current?.onChange(value[0])
				return
			}
			fieldRef.current?.onChange([
				...getValue(fieldRef.current?.value),
				...value,
			])
		},
		[multiple, getValue],
	)

	const onPressImage = useCallback(() => {
		launchImageLibraryAsync(options).then(v => {
			setValue(v.assets)
		})
	}, [options, setValue])

	const onPressCamera = useCallback(() => {
		if (!scanner) {
			launchCameraAsync(options).then(v => {
				setValue(v.assets)
			})

			return
		}
		launchScanner({ quality: 1, includeBase64: false }).then(v => {
			setValue(v.images)
		})
	}, [scanner, options, setValue])

	const onPressDocument = useCallback(async () => {
		const result = await getDocumentAsync({
			type: ['image/*', 'application/pdf'],
			multiple,
		})
		if (!result.assets?.length) return
		const images: any[] = []
		for (const asset of result.assets) {
			if (asset.uri.endsWith('.pdf')) {
				const { outputFiles } = await convertPdfToImage(asset.uri)
				if (outputFiles?.length) {
					for (const outputFile of outputFiles) {
						const file = new File(`file://${outputFile}`)
						const fileInfo = file.info()
						if (fileInfo.exists) {
							images.push(fileInfo)
						}
					}
				}
			} else {
				images.push(asset)
			}
		}
		setValue(images)
	}, [multiple, setValue])

	const handleRemove = useCallback(
		(field: TField, index: number) => {
			if (multiple) {
				const current = Array.isArray(field.value) ? [...field.value] : []
				const next = current.filter((_, idx) => idx !== index)
				field.onChange(next)
				return
			}
			field.onChange(null)
		},
		[multiple],
	)

	const [visible, setVisible] = useState(false)
	const onOpenDialog = useCallback((field: TField) => {
		Keyboard.dismiss()
		setVisible(true)
		fieldRef.current = field
	}, [])

	return (
		<Fragment>
			<BaseController
				{...props}
				render={v => {
					const assets = getValue(v.field.value)
					return (
						<View className="gap-4">
							<Grid className="gap-4" _extra={{ className: 'grid-cols-3' }}>
								{assets.map((asset, index) => (
									<GridItem key={index} _extra={{ className: 'col-span-1' }}>
										<Pressable
											className="relative rounded overflow-hidden border border-background-300"
											onPress={() => {
												if (multiple) {
													openImageViewer(assets, index)
													return
												}
												onOpenDialog(v.field)
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
												<Icon
													name="x"
													size="lg"
													className="text-background-300"
												/>
											</Pressable>
										</Pressable>
									</GridItem>
								))}
								{(multiple || (!multiple && !assets.length)) && (
									<GridItem
										_extra={{ className: 'col-span-1' }}
										className="aspect-square"
									>
										<Button
											variant="outline"
											className="border-background-300 h-full"
											onPress={() => onOpenDialog(v.field)}
										>
											<ButtonIcon name="plus" size="lg" />
										</Button>
									</GridItem>
								)}
							</Grid>
						</View>
					)
				}}
			/>
			<BaseDialog height={180} visible={visible} setVisible={setVisible}>
				<View className="flex-1 flex-row gap-4 justify-center px-4 py-8">
					<Button
						variant="outline"
						className="h-20 w-20 rounded-full"
						onPress={onPressDocument}
					>
						<Icon name="folder" size="2xl" />
					</Button>
					<Button
						variant="outline"
						className="h-20 w-20 rounded-full"
						onPress={onPressImage}
					>
						<Icon name="image" size="2xl" />
					</Button>
					<Button
						variant="outline"
						className="h-20 w-20 rounded-full"
						onPress={onPressCamera}
					>
						<Icon name="camera" size="2xl" />
					</Button>
				</View>
			</BaseDialog>
		</Fragment>
	)
}

export const BaseImagePicker = forwardRef(BaseImagePickerInner) as <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	props: TBaseImagePickerProps<TFieldValues, TName> & { ref?: Ref<any> },
) => ReturnType<typeof BaseImagePickerInner>
