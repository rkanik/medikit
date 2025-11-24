import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView as RNGestureHandlerRootView } from 'react-native-gesture-handler'

export const GestureHandlerRootView = ({
	children,
}: {
	children: React.ReactNode
}) => {
	return (
		<RNGestureHandlerRootView style={{ flex: 1 }}>
			<BottomSheetModalProvider>{children}</BottomSheetModalProvider>
		</RNGestureHandlerRootView>
	)
}
