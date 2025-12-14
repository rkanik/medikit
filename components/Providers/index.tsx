import { GestureHandlerRootView } from '@/components/GestureHandlerRootView'
import { ThemeProvider } from '@/components/ThemeProvider'
import { TextProvider } from '@/components/ui/text'
import { AuthProvider } from '@/context/AuthContext'
import { ImageViewerProvider } from '@/context/ImageViewerProvider'
import { Downloader } from '@/hooks/useDownloader'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { setNotificationHandler } from 'expo-notifications'

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
				<TextProvider className="text-black dark:text-white">
					<BottomSheetModalProvider>
						<AuthProvider>
							<ImageViewerProvider>
								<Downloader>{children}</Downloader>
							</ImageViewerProvider>
						</AuthProvider>
					</BottomSheetModalProvider>
				</TextProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	)
}
