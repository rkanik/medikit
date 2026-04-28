import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { setNotificationHandler } from 'expo-notifications'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { ThemeProvider } from '@/components/ThemeProvider'
import { TextProvider } from '@/components/ui/text'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider } from '@/context/AuthContext'
import { ImageViewerProvider } from '@/context/ImageViewerProvider'
import { QueryProvider } from '@/context/QueryProvider'
import { Downloader } from '@/hooks/useDownloader'
import { Offline } from '../Offline'

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
		<ThemeProvider>
			<GestureHandlerRootView className="flex-1">
				<TextProvider className="text-foreground">
					<SafeAreaProvider className="">
						<QueryProvider>
							<BottomSheetModalProvider>
								<AuthProvider>
									<ImageViewerProvider>
										<Downloader>
											<AppProvider>
												<SafeAreaView edges={['top']} className="flex-1">
													<Offline />
													{children}
												</SafeAreaView>
											</AppProvider>
										</Downloader>
									</ImageViewerProvider>
								</AuthProvider>
							</BottomSheetModalProvider>
						</QueryProvider>
					</SafeAreaProvider>
				</TextProvider>
			</GestureHandlerRootView>
		</ThemeProvider>
	)
}
