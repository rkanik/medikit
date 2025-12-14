import { useScheme } from '@/hooks/useScheme'
import { forwardRef } from 'react'
import { PressableProps, Pressable as RNPressable, View } from 'react-native'

export const Pressable = forwardRef<View, PressableProps>(function Pressable(
	v: PressableProps,
	ref,
) {
	const { scheme } = useScheme()
	return (
		<RNPressable
			{...v}
			ref={ref}
			android_ripple={{
				foreground: true,
				color: scheme({
					dark: 'rgba(255, 255, 255, 0.3)',
					light: 'rgba(0, 0, 0, 0.3)',
				}),
			}}
		/>
	)
})
