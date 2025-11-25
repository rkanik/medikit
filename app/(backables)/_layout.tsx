import { useScheme } from '@/hooks/useScheme'
import { Stack } from 'expo-router'
import { Fragment } from 'react'
import { neutral } from 'tailwindcss/colors'

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
