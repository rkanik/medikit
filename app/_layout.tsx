import '@/global.css'
import 'react-native-reanimated'

import { Logs } from '@/components/Logs'
import { Providers } from '@/components/Providers'
import { colors } from '@/const/colors'
import { useScheme } from '@/hooks/useScheme'
import { initializeBackgroundTask } from '@/services/background'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'

export const unstable_settings = {
	anchor: '(tabs)',
}

// Declare a variable to store the resolver function
let resolver: (() => void) | null

// Create a promise and store its resolve function for later
const promise = new Promise<void>(resolve => {
	resolver = resolve
})

// Pass the promise to the background task, it will wait until the promise resolves
initializeBackgroundTask(promise)

export default function RootLayout() {
	const { scheme } = useScheme()

	useEffect(() => {
		if (resolver) resolver()
	}, [])

	return (
		<Providers>
			<Logs />
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
							dark: colors.neutral[900],
							light: colors.neutral[100],
						}),
					},
					headerStyle: {
						backgroundColor: scheme({
							dark: colors.neutral[800],
							light: colors.neutral[100],
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
