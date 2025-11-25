import { Button, ButtonIcon } from '@/components/ui/button'
import { Image } from 'expo-image'
import { PlusIcon, XIcon } from 'lucide-react-native'
import type { Ref } from 'react'
import { forwardRef, useCallback } from 'react'
import type { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'
import { Pressable, View } from 'react-native'
import { BaseController, TBaseControllerProps } from '../controller'

import {
	ImagePickerOptions,
	launchImageLibraryAsync,
	useMediaLibraryPermissions,
} from 'expo-image-picker'

type TProps<T extends FieldValues> = TBaseControllerProps<T> & {
	options?: ImagePickerOptions
}

const BaseImagePickerInner = <T extends FieldValues>(
	props: TProps<T>,
	ref: Ref<any>,
) => {
	const [permission, request] = useMediaLibraryPermissions()
	const allowsMultipleSelection = props.options?.allowsMultipleSelection

	const toAssetArray = useCallback((value: any) => {
		if (!value) {
			return []
		}
		if (Array.isArray(value)) {
			return value
		}
		return [value]
	}, [])

	const onPress = useCallback(
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
						{!!assets.length && (
							<View className="flex-row flex-wrap gap-3">
								{assets.map((asset, index) => (
									<Pressable
										key={asset?.assetId ?? asset?.uri ?? index}
										className="relative rounded overflow-hidden border border-background-300"
										onPress={() => {
											if (allowsMultipleSelection) return
											onPress(v.field)
										}}
									>
										<Image
											source={{ uri: asset?.uri }}
											style={{ width: 96, height: 96 }}
											contentFit="cover"
										/>
										<Pressable
											onPress={() => handleRemove(v.field, index)}
											className="absolute right-1 top-1 rounded-full bg-black/70 p-1"
											hitSlop={8}
										>
											<XIcon size={14} color="#fff" />
										</Pressable>
									</Pressable>
								))}
							</View>
						)}
						{(allowsMultipleSelection ||
							(!allowsMultipleSelection && !assets.length)) && (
							<Button
								variant="outline"
								style={{ width: 96, height: 96 }}
								className="border-background-300"
								onPress={() => onPress(v.field)}
							>
								<ButtonIcon as={PlusIcon} size="lg" />
							</Button>
						)}
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
