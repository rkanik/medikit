import '@/global.css'
import 'react-native-reanimated'

import { Fragment, useEffect } from 'react'

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { Logs } from '@/components/Logs'
import { Providers } from '@/components/Providers'
import { useScheme } from '@/hooks/useScheme'
import { useSchemeColors } from '@/hooks/useSchemeColors'
import { initializeBackgroundTask } from '@/services/background'

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

const RootLayoutInner = () => {
	const { scheme } = useScheme()
	const { backgroundColor } = useSchemeColors()
	return (
		<Fragment>
			<Logs />
			<StatusBar
				style={scheme({
					dark: 'light',
					light: 'dark',
				})}
			/>
			<Stack
				screenOptions={{
					headerStyle: { backgroundColor },
					contentStyle: { backgroundColor },
				}}
			>
				<Stack.Screen
					name="(tabs)"
					options={{
						headerShown: false,
					}}
				/>
			</Stack>
		</Fragment>
	)
}

export default function RootLayout() {
	useEffect(() => {
		if (resolver) {
			resolver()
		}
	}, [])

	return (
		<Providers>
			<RootLayoutInner />
		</Providers>
	)
}
