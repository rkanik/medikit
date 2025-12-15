import { BaseActions } from '@/components/base/actions'
import { RecordCard } from '@/components/RecordCard'
import { router } from 'expo-router'
import { View } from 'react-native'

import { useCurrentPatient } from '@/api/patients'
import { useRecords } from '@/api/records'
import { FlashList } from '@/components/FlashList'
import { NoRecords } from '@/components/NoRecords'
import { PatientCard } from '@/components/PatientCard'
import { RecordsSummary } from '@/components/RecordsSummary'
import { Title } from '@/components/ui/text'
import { Fragment } from 'react'
import { cn } from 'tailwind-variants'

export default function Screen() {
	const { data: currentPatient } = useCurrentPatient()
	const { data } = useRecords({ patientId: currentPatient?.id })
	return (
		<View className="flex-1 relative">
			<FlashList
				data={data}
				keyExtractor={item => item.id?.toString() ?? ''}
				contentContainerClassName={cn('flex-grow flex-col-reverse px-4', {
					'pb-4': data.length === 0,
					'pb-28': data.length > 0,
				})}
				ListFooterComponent={() => {
					if (!data.length) return <NoRecords />
					return (
						<Fragment>
							{currentPatient && (
								<Fragment>
									<Title className="mt-4 mb-2">Patient</Title>
									<PatientCard data={currentPatient} className="mb-4" />
								</Fragment>
							)}
							<RecordsSummary patientId={currentPatient?.id} />
							<Title className="mt-4 mb-2">Records</Title>
						</Fragment>
					)
				}}
				renderItem={({ item, index }) => (
					<RecordCard
						data={item}
						className={index ? 'mt-4' : ''}
						showPatient={!currentPatient}
						onPress={() => router.push(`/records/${item.id}`)}
					/>
				)}
			/>
			{data.length > 0 && (
				<BaseActions
					className="bottom-8"
					data={[
						{
							icon: 'plus',
							text: 'Add Record',
							onPress: () => router.push('/records/new/form'),
						},
					]}
				/>
			)}
		</View>
	)
}
