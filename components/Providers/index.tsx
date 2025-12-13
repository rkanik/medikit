import { AuthProvider } from '@/context/AuthContext'
import { ImageViewerProvider } from '@/context/ImageViewerProvider'
import { Downloader } from '@/hooks/useDownloader'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { setNotificationHandler } from 'expo-notifications'
import { GestureHandlerRootView } from '../GestureHandlerRootView'
import { ThemeProvider } from '../ThemeProvider'
import { Text } from '../ui/text'

setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: false,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
})

export const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<GestureHandlerRootView>
			<ThemeProvider>
				<Text.Provider className="text-black dark:text-white">
					<BottomSheetModalProvider>
						<AuthProvider>
							<ImageViewerProvider>
								<Downloader>{children}</Downloader>
							</ImageViewerProvider>
						</AuthProvider>
					</BottomSheetModalProvider>
				</Text.Provider>
			</ThemeProvider>
		</GestureHandlerRootView>
	)
}
