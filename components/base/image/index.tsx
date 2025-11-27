import { Image, ImageProps } from 'expo-image'
import { useCallback, useEffect, useState } from 'react'
import {
	DimensionValue,
	GestureResponderEvent,
	LayoutChangeEvent,
	Pressable,
	Image as RNImage,
} from 'react-native'

type TBaseImageProps = Omit<ImageProps, 'source' | 'style'> & {
	uri?: string
	aspectRatio?: number
	imageClassName?: string
	onPress?: (event: GestureResponderEvent) => void
}

export const BaseImage = ({
	uri,
	className,
	aspectRatio,
	imageClassName,
	onPress,
	...props
}: TBaseImageProps) => {
	const [height, setHeight] = useState<DimensionValue>()
	const [layoutWidth, setLayoutWidth] = useState(0)

	useEffect(() => {
		if (uri && !aspectRatio) {
			RNImage.getSize(uri, (width, height) => {
				setHeight(layoutWidth * (height / width))
			})
		}
	}, [uri, aspectRatio, layoutWidth])

	const onLayout = useCallback((event: LayoutChangeEvent) => {
		const { width } = event.nativeEvent.layout
		setLayoutWidth(width)
	}, [])

	return (
		<Pressable onPress={onPress} onLayout={onLayout} className={className}>
			<Image
				{...props}
				source={{ uri }}
				style={{ height, aspectRatio }}
				className={imageClassName}
			/>
		</Pressable>
	)
}
