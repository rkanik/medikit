import { useScheme } from '@/hooks/useScheme'
import { useSchemeColors } from '@/hooks/useSchemeColors'
import { Stack } from 'expo-router'
import { Fragment } from 'react'

export default function Layout() {
	const { scheme } = useScheme()
	const { backgroundColor } = useSchemeColors()
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
						backgroundColor,
					},
					headerStyle: {
						backgroundColor,
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
