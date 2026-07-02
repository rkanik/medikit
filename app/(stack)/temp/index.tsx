import { ScrollView, View } from 'react-native'
import { Stack } from 'expo-router'
import { BaseJson } from '@/components/base/Json'
import { Text } from '@/components/ui/text'
import { useRecordsQuery } from '@/queries/useRecordsQuery'

export default function Screen() {
	const { data, isLoading, error } = useRecordsQuery()

	return (
		<ScrollView
			contentContainerClassName="px-4"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Stack.Screen options={{ title: 'Temp' }} />
			<View className="flex-1 py-4 gap-4">
				<Text className="font-bold">Records with related data</Text>
				{isLoading && <Text>Loading records...</Text>}
				{error && (
					<Text className="text-red-500">
						{error.message || 'Failed to load records'}
					</Text>
				)}
				<BaseJson data={data} />
			</View>
		</ScrollView>
	)
}
