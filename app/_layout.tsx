import '@/global.css'
import 'react-native-reanimated'

import { Providers } from '@/components/Providers'
import { useScheme } from '@/hooks/useScheme'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { neutral } from 'tailwindcss/colors'

export const unstable_settings = {
	anchor: '(tabs)',
}

export default function RootLayout() {
	const { scheme } = useScheme()
	return (
		<Providers>
			<StatusBar
				style={scheme({
					dark: 'light',
					light: 'dark',
				})}
			/>
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
		</Providers>
	)
}
