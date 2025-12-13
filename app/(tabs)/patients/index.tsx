import { api } from '@/api'
import { BaseActions } from '@/components/base/actions'
import { FlashList } from '@/components/FlashList'
import { PatientCard } from '@/components/PatientCard'
import { router } from 'expo-router'
import { View } from 'react-native'

export default function PatientsScreen() {
	const { data } = api.patients.usePatients()
	return (
		<View className="flex-1 relative">
			<FlashList
				data={data}
				keyExtractor={item => item.id?.toString() ?? ''}
				contentContainerStyle={{ flexGrow: 1 }}
				contentContainerClassName="flex-col-reverse pb-28 px-4"
				renderItem={({ item, index }) => (
					<PatientCard
						data={item}
						className={index ? 'mt-4' : ''}
						onPress={() => router.push(`/patients/${item.id}`)}
					/>
				)}
			/>
			<BaseActions
				className="bottom-8"
				data={[
					{
						icon: 'plus',
						text: 'Patient',
						onPress: () => router.push('/patients/new/form'),
					},
				]}
			/>
		</View>
	)
}
