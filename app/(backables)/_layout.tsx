import { useScheme } from '@/hooks/useScheme'
import { Stack } from 'expo-router'
import { Fragment } from 'react'

export default function Layout() {
	const { scheme } = useScheme()
	return (
		<Fragment>
			<Stack.Screen
				options={{
					headerShown: false,
				}}
			/>
			<Stack
				screenOptions={{
					contentStyle: {
						backgroundColor: 'transparent',
					},
					headerStyle: {
						backgroundColor: 'transparent',
					},
					headerShadowVisible: false,
					headerTintColor: scheme({
						dark: 'white',
						light: 'black',
					}),
				}}
			/>
		</Fragment>
	)
}
