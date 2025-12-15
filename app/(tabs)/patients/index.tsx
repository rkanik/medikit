import { api } from '@/api'
import { BaseActions } from '@/components/base/actions'
import { FlashList } from '@/components/FlashList'
import { NoPatients } from '@/components/NoPatients'
import { PatientCard } from '@/components/PatientCard'
import { router } from 'expo-router'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'

export default function PatientsScreen() {
	const { data } = api.patients.usePatients()
	return (
		<View className="flex-1 relative">
			<FlashList
				data={data}
				keyExtractor={item => item.id?.toString() ?? ''}
				contentContainerStyle={{ flexGrow: 1 }}
				contentContainerClassName={cn('flex-grow flex-col-reverse px-4', {
					'pb-4': data.length === 0,
					'pb-28': data.length > 0,
				})}
				renderItem={({ item, index }) => (
					<PatientCard
						data={item}
						className={index ? 'mt-4' : ''}
						onPress={() => router.push(`/patients/${item.id}`)}
					/>
				)}
				ListFooterComponent={() => {
					if (!data.length) return <NoPatients />
					return null
				}}
			/>
			{data.length > 0 && (
				<BaseActions
					className="bottom-8"
					data={[
						{
							icon: 'plus',
							text: 'Add Patient',
							onPress: () => router.push('/patients/new/form'),
						},
					]}
				/>
			)}
		</View>
	)
}
