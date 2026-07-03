import { Stack } from 'expo-router'
import { useColors } from '@/hooks/useColors'

export default function Layout() {
	const { background, foreground } = useColors()
	return (
		<Stack
			screenOptions={{
				headerShown: true,
				contentStyle: {
					backgroundColor: background,
				},
				headerStyle: {
					backgroundColor: background,
				},
				headerTintColor: foreground,
				headerShadowVisible: false,
			}}
		/>
	)
}
