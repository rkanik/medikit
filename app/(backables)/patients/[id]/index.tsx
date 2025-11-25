import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Fragment } from 'react'

export default function Screen() {
	const { id } = useLocalSearchParams()

	return (
		<Fragment>
			<Stack.Screen options={{ title: 'Patient Details' }} />
			<Box className="bg-blue-500">
				<Text>ParentsScreen</Text>
				<Text>{id}</Text>
			</Box>
		</Fragment>
	)
}
