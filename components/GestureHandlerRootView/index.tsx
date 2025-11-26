import { PropsWithChildren } from 'react'
import { GestureHandlerRootView as RNGestureHandlerRootView } from 'react-native-gesture-handler'

export const GestureHandlerRootView = ({ children }: PropsWithChildren) => {
	return (
		<RNGestureHandlerRootView style={{ flex: 1 }}>
			{children}
		</RNGestureHandlerRootView>
	)
}
