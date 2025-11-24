import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import { AuthProvider } from '@/context/AuthContext'
import '@/global.css'
import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'

export const unstable_settings = {
	anchor: '(tabs)',
}

export default function RootLayout() {
	const { colorScheme } = useColorSchemeStorage()
	return (
		<GluestackUIProvider mode={colorScheme}>
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
		</GluestackUIProvider>
	)
}
