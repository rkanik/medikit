import type { TRecordsQuery } from '@/api/records'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'

import { router } from 'expo-router'
import { cn } from 'tailwind-variants'

import { useCurrentPatient } from '@/api/patients'
import { useRecords } from '@/api/records'
import { BaseActions } from '@/components/base/actions'
import { NoRecords } from '@/components/NoRecords'
import { PatientCard } from '@/components/PatientCard'
import { RecordCard } from '@/components/RecordCard'
import { RecordsSummary } from '@/components/RecordsSummary'
import { Input } from '@/components/ui/input'
import { Title } from '@/components/ui/text'
import { useApp } from '@/context/AppContext'

export default function Screen() {
	const [q, setQ] = useState('')
	const { data: currentPatient } = useCurrentPatient()

	const query = useMemo<TRecordsQuery>(() => {
		return {
			q,
			patientId: currentPatient?.id,
		}
	}, [q, currentPatient?.id])

	const { data } = useRecords(query)

	const { isSearching } = useApp()
	useEffect(() => {
		if (!isSearching) {
			setQ('')
		}
	}, [isSearching])

	return (
		<View className="flex-1 relative">
			{isSearching && (
				<View className="px-4 pb-2">
					<Input
						autoFocus
						value={q}
						placeholder="Search..."
						onChangeText={setQ}
					/>
				</View>
			)}
			<ScrollView
				contentContainerClassName={cn('flex-grow justify-end px-4 gap-4 pb-8', {
					'pb-4': data.length === 0,
					'pb-28': data.length > 0,
				})}
			>
				{data.length > 0 ? (
					<Fragment>
						{currentPatient && (
							<View className="gap-2">
								<Title>Patient</Title>
								<PatientCard data={currentPatient} />
							</View>
						)}

						<RecordsSummary query={query} />

						{/* Records */}
						<View>
							<Title>Records</Title>
							<View className="gap-4 mt-2">
								{data.map(item => (
									<RecordCard
										key={item.id}
										data={item}
										showPatient={!currentPatient}
										onPress={() => router.push(`/records/${item.id}`)}
									/>
								))}
							</View>
						</View>
					</Fragment>
				) : (
					<NoRecords />
				)}

				{/* <FlashList
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
			/> */}
			</ScrollView>
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
