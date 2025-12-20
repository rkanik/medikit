import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { setNotificationHandler } from 'expo-notifications'

import { GestureHandlerRootView } from '@/components/GestureHandlerRootView'
import { ThemeProvider } from '@/components/ThemeProvider'
import { TextProvider } from '@/components/ui/text'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider } from '@/context/AuthContext'
import { ImageViewerProvider } from '@/context/ImageViewerProvider'
import { Downloader } from '@/hooks/useDownloader'

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
								<Downloader>
									<AppProvider>{children}</AppProvider>
								</Downloader>
							</ImageViewerProvider>
						</AuthProvider>
					</BottomSheetModalProvider>
				</TextProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	)
}
