import { api } from '@/api'
import { RecordCard } from '@/components/RecordCard'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { ImageViewerProvider } from '@/context/ImageViewerProvider'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { PlusIcon } from 'lucide-react-native'
import { View } from 'react-native'

export default function Screen() {
	const { data } = api.records.useRecords()
	return (
		<ImageViewerProvider>
			<View className="flex-1 relative">
				<FlashList
					data={data}
					keyExtractor={item => item.id?.toString() ?? ''}
					contentContainerStyle={{ flexGrow: 1 }}
					contentContainerClassName="flex-col-reverse pb-20 px-4"
					renderItem={({ item }) => (
						<RecordCard
							data={item}
							className="mb-4"
							onPress={() => router.push(`/records/${item.id}`)}
						/>
					)}
				/>
				<View className="flex-row justify-center p-5 absolute bottom-0 left-0 right-0">
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
		</ImageViewerProvider>
	)
}
