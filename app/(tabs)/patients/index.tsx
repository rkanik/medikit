import { api } from '@/api'
import { PatientCard } from '@/components/PatientCard'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { PlusIcon } from 'lucide-react-native'
import { View } from 'react-native'

export default function PatientsScreen() {
	const { data } = api.patients.usePatients()
	return (
		<View className="flex-1 relative">
			<FlashList
				data={data}
				keyExtractor={item => item.id?.toString() ?? ''}
				contentContainerStyle={{ flexGrow: 1 }}
				contentContainerClassName="flex-col-reverse pb-20 px-4"
				renderItem={({ item }) => (
					<PatientCard
						data={item}
						className="mb-4"
						onPress={() => router.push(`/patients/${item.id}`)}
					/>
				)}
			/>
			<View className="flex-row justify-center p-5 absolute bottom-0 left-0 right-0">
				<Button
					size="xl"
					variant="solid"
					className="rounded-full"
					onPress={() => router.push('/patients/new/form')}
				>
					<ButtonIcon as={PlusIcon} size="lg" />
					<ButtonText size="md">Add Patient</ButtonText>
				</Button>
			</View>
		</View>
	)
}
