import { AuthProvider } from '@/context/AuthContext'
import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from '../GestureHandlerRootView'
import { GluestackUIProvider } from '../ui/gluestack-ui-provider'

export const Providers = ({ children }: { children: React.ReactNode }) => {
	const { colorScheme } = useColorSchemeStorage()
	return (
		<GluestackUIProvider mode={colorScheme}>
			<GestureHandlerRootView>
				<BottomSheetModalProvider>
					<AuthProvider>{children}</AuthProvider>
				</BottomSheetModalProvider>
			</GestureHandlerRootView>
		</GluestackUIProvider>
	)
}
