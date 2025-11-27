import { api } from '@/api'
import { BaseActions } from '@/components/base/actions'
import { PatientCard } from '@/components/PatientCard'
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
				renderItem={({ item, index }) => (
					<PatientCard
						data={item}
						className={index ? 'mt-4' : ''}
						onPress={() => router.push(`/patients/${item.id}`)}
					/>
				)}
			/>
			<BaseActions
				className="bottom-4"
				data={[
					{
						icon: PlusIcon,
						text: 'Patient',
						onPress: () => router.push('/patients/new/form'),
					},
				]}
			/>
		</View>
	)
}
