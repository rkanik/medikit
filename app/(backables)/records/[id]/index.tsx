import { Text } from '@/components/ui/text'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Fragment } from 'react'
import { View } from 'react-native'

export default function Screen() {
	const { id } = useLocalSearchParams()
	return (
		<Fragment>
			<Stack.Screen options={{ title: 'Record' }} />
			<View className="flex-1 px-5">
				<Text>Record: {id}</Text>
			</View>
		</Fragment>
	)
}
