import '@/global.css'
import 'react-native-reanimated'

import { Fragment, useEffect } from 'react'
import { Alert } from 'react-native'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { Stack } from 'expo-router'
import { Logs } from '@/components/Logs'
import { Providers } from '@/components/Providers'
import { db } from '@/drizzle/db'
import migrations from '@/drizzle/migrations'
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
	const { error, success } = useMigrations(db, migrations)
	useDrizzleStudio(db.$client)
	useEffect(() => {
		if (error) {
			Alert.alert('Error', error.message || 'An unknown error occurred')
		}
		if (success) {
			console.log('Migrations completed successfully')
		}
	}, [error, success])

	return (
		<Fragment>
			<Logs />
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
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
