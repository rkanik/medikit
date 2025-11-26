import { Button, ButtonIcon } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { EditIcon } from 'lucide-react-native'
import { Fragment } from 'react'
import { View } from 'react-native'

export default function Screen() {
	const { id } = useLocalSearchParams()
	return (
		<Fragment>
			<Stack.Screen
				options={{
					title: 'Record',
					headerRight: () => (
						<Button
							size="lg"
							variant="link"
							onPress={() => router.push(`/records/${id}/form`)}
						>
							<ButtonIcon as={EditIcon} size="lg" />
						</Button>
					),
				}}
			/>
			<View className="flex-1 px-5">
				<Text>Record: {id}</Text>
			</View>
		</Fragment>
	)
}
