import { api } from '@/api'
import { BaseJson } from '@/components/base/Json'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { EditIcon } from 'lucide-react-native'
import { Fragment, useCallback } from 'react'
import { Alert, ScrollView, View } from 'react-native'

export default function Screen() {
	const { id } = useLocalSearchParams()

	const { data, remove } = api.records.useRecordById(Number(id))

	const onDelete = useCallback(() => {
		Alert.alert(
			'Delete Record',
			'Are you sure you want to delete this record?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					onPress() {
						remove()
						router.back()
					},
				},
			],
		)
	}, [remove])

	if (!data) {
		return (
			<Fragment>
				<Stack.Screen options={{ title: 'Not Found!' }} />
				<View className="flex-1 px-5">
					<Text>Record not found!</Text>
				</View>
			</Fragment>
		)
	}

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
			<ScrollView contentContainerClassName="px-5">
				<Text>Record: {id}</Text>
				<Button size="xl" variant="outline" onPress={onDelete}>
					<ButtonText size="md">Delete</ButtonText>
				</Button>
				<BaseJson data={data} />
			</ScrollView>
		</Fragment>
	)
}
