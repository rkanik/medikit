import { AuthProvider } from '@/context/AuthContext'
import { ImageViewerProvider } from '@/context/ImageViewerProvider'
import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'
import { Downloader } from '@/hooks/useDownloader'
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
						<ImageViewerProvider>
							<Downloader>{children}</Downloader>
						</ImageViewerProvider>
					</AuthProvider>
				</BottomSheetModalProvider>
			</GluestackUIProvider>
		</GestureHandlerRootView>
	)
}
