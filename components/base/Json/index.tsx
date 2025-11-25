import { Text } from '@/components/ui/text'
import { View } from 'react-native'

export const BaseJson = (props: { data: any }) => {
	return (
		<View className="border dark:bg-neutral-900  dark:border-neutral-700 p-4 rounded-lg">
			<Text>{JSON.stringify(props.data, null, 2)}</Text>
		</View>
	)
}
