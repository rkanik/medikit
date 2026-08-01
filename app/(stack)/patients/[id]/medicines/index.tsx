import { useMemo, useRef } from 'react'
import { RefreshControl, View } from 'react-native'
import { useScrollToTop } from '@react-navigation/native'
import { router } from 'expo-router'
import { cn } from 'tailwind-variants'
import { BaseActions } from '@/components/base/actions'
import { FlashList } from '@/components/FlashList'
import { NoPatientMedicines } from '@/components/NoPatientMedicines'
import { PatientMedicineCard } from '@/components/PatientMedicineCard'
import { usePatientIdParam } from '@/hooks/usePatientIdParam'
import { usePatientMedicinesQuery } from '@/queries/usePatientMedicinesQuery'

export default function PatientMedicinesScreen() {
	const { id, patientId } = usePatientIdParam()
	const {
		data,
		isFetching,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		fetchNextPage,
	} = usePatientMedicinesQuery({
		patientId,
		page: 1,
		perPage: 10,
	})

	const medicines = useMemo(() => {
		return (data?.pages ?? [])
			.flatMap(page => page.data ?? [])
			.filter(item => !!item.medicine)
	}, [data?.pages])

	const listRef = useRef<any>(null)
	useScrollToTop(listRef)

	return (
		<View className="flex-1 relative">
			<FlashList
				ref={listRef}
				data={medicines}
				keyExtractor={item => item.id?.toString() ?? ''}
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: medicines.length > 0 ? 16 * 6 : 16,
					justifyContent: 'flex-end',
					paddingHorizontal: 16,
				}}
				renderItem={({ item, index }) => (
					<PatientMedicineCard
						data={item}
						className={cn({
							'mt-1': index > 0,
							'rounded-t-3xl': index === 0,
							'rounded-b-3xl': index === medicines.length - 1,
						})}
						onPress={() =>
							router.push(`/patients/${id}/medicines/${item.id}/form`)
						}
					/>
				)}
				ListFooterComponent={() => {
					if (!medicines.length)
						return <NoPatientMedicines patientId={patientId} />
					return null
				}}
				refreshControl={
					<RefreshControl refreshing={isFetching} onRefresh={refetch} />
				}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage()
					}
				}}
			/>
			{medicines.length > 0 && (
				<BaseActions
					className="bottom-8"
					data={[
						{
							pill: true,
							prependIcon: 'plus',
							title: 'Medicine',
							onPress: () =>
								router.push(`/patients/${id}/medicines/new/form`),
						},
					]}
				/>
			)}
		</View>
	)
}
