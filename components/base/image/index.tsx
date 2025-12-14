import { Image, ImageProps } from 'expo-image'
import { useCallback, useEffect, useState } from 'react'
import {
	DimensionValue,
	LayoutChangeEvent,
	Image as RNImage,
	View,
	ViewProps,
} from 'react-native'

type TBaseImageProps = Omit<ImageProps, 'source' | 'style'> & {
	uri?: string
	viewProps?: ViewProps
	aspectRatio?: number
}

export const BaseImage = ({
	uri,
	viewProps,
	aspectRatio,
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

	const onLayout = useCallback(
		(event: LayoutChangeEvent) => {
			const { width } = event.nativeEvent.layout
			setLayoutWidth(width)
			viewProps?.onLayout?.(event)
		},
		[viewProps],
	)

	return (
		<View {...viewProps} onLayout={onLayout}>
			<Image {...props} source={{ uri }} style={{ height, aspectRatio }} />
		</View>
	)
}
