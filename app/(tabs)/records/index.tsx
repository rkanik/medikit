import { api } from '@/api'
import { RecordCard } from '@/components/RecordCard'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { PlusIcon } from 'lucide-react-native'
import { View } from 'react-native'

export default function PatientsScreen() {
	const { data } = api.records.useRecords()
	return (
		<View className="flex-1">
			<FlashList
				data={data}
				contentContainerClassName="px-8 flex-col-reverse flex-1"
				renderItem={({ item }) => (
					<RecordCard
						data={item}
						onPress={() => router.push(`/records/${item.id}`)}
					/>
				)}
			/>
			<View className="flex-row justify-center p-5">
				<Button
					size="xl"
					variant="solid"
					className="rounded-full"
					onPress={() => router.push('/records/new/form')}
				>
					<ButtonIcon as={PlusIcon} size="lg" />
					<ButtonText size="md">Add Record</ButtonText>
				</Button>
			</View>
		</View>
	)
}
