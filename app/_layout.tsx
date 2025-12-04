import '@/global.css'
import 'react-native-reanimated'

import { Providers } from '@/components/Providers'
import { useScheme } from '@/hooks/useScheme'
import { initializeBackgroundTask } from '@/services/background'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { green, neutral } from 'tailwindcss/colors'

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

	const appState = useRef(AppState.currentState)

	useEffect(() => {
		// Resolve the promise to indicate that the inner app has mounted
		if (resolver) {
			resolver()
			console.log('Resolver called')
		}

		// Subscribe to app state changes
		const appStateSubscription = AppState.addEventListener(
			'change',
			(nextAppState: AppStateStatus) => {
				if (
					appState.current.match(/inactive|background/) &&
					nextAppState === 'active'
				) {
					// App has come to the foreground
					console.log('App has come to the foreground!')
				}
				if (appState.current.match(/active/) && nextAppState === 'background') {
					console.log('App has gone to the background!')
				}
				appState.current = nextAppState
			},
		)

		// Cleanup subscription on unmount
		return () => {
			appStateSubscription.remove()
		}
	}, [])

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
							dark: neutral[900],
							light: green[50],
						}),
					},
					headerStyle: {
						backgroundColor: scheme({
							dark: neutral[800],
							light: green[50],
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
