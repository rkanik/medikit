import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { GestureHandlerRootView } from '@/components/GestureHandlerRootView'
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import { AuthProvider } from '@/context/AuthContext'
import '@/global.css'
import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'
import { useScheme } from '@/hooks/useScheme'
import { neutral } from 'tailwindcss/colors'

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
					<Stack
						screenOptions={{
							contentStyle: {
								backgroundColor: scheme({
									dark: neutral[800],
									light: neutral[50],
								}),
							},
							headerStyle: {
								backgroundColor: scheme({
									dark: neutral[800],
									light: neutral[50],
								}),
							},
						}}
					>
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
