import { Fragment } from 'react'
import { Stack } from 'expo-router'
import { useColors } from '@/hooks/useColors'
import { useScheme } from '@/hooks/useScheme'
import { useSchemeColors } from '@/hooks/useSchemeColors'

export default function Layout() {
	const { scheme } = useScheme()
	const { background } = useColors()
	return (
		<Fragment>
			<Stack.Screen
				options={{
					headerShown: true,
				}}
			/>
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: {
						backgroundColor: background,
					},
					headerStyle: {
						backgroundColor: background,
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
