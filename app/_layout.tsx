import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { GestureHandlerRootView } from '@/components/GestureHandlerRootView'
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import { AuthProvider } from '@/context/AuthContext'
import '@/global.css'
import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'
import { useScheme } from '@/hooks/useScheme'

export const unstable_settings = {
	anchor: '(tabs)',
}

export default function RootLayout() {
	const { scheme } = useScheme()
	const { colorScheme } = useColorSchemeStorage()
	return (
		<GluestackUIProvider mode={colorScheme}>
			<StatusBar
				style={scheme({
					dark: 'light',
					light: 'dark',
				})}
			/>
			<GestureHandlerRootView>
				<AuthProvider>
					<Stack>
						<Stack.Screen
							name="(tabs)"
							options={{
								headerShown: false,
							}}
						/>
					</Stack>
				</AuthProvider>
			</GestureHandlerRootView>
		</GluestackUIProvider>
	)
}
