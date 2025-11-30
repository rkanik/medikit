import { AuthProvider } from '@/context/AuthContext'
import { ImageViewerProvider } from '@/context/ImageViewerProvider'
import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { setNotificationHandler } from 'expo-notifications'
import { GestureHandlerRootView } from '../GestureHandlerRootView'
import { GluestackUIProvider } from '../ui/gluestack-ui-provider'

setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: false,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
})

export const Providers = ({ children }: { children: React.ReactNode }) => {
	const { colorScheme } = useColorSchemeStorage()
	return (
		<GestureHandlerRootView>
			<GluestackUIProvider mode={colorScheme}>
				<BottomSheetModalProvider>
					<AuthProvider>
						<ImageViewerProvider>{children}</ImageViewerProvider>
					</AuthProvider>
				</BottomSheetModalProvider>
			</GluestackUIProvider>
		</GestureHandlerRootView>
	)
}
