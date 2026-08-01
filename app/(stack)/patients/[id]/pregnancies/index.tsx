import { useMemo, useRef } from 'react'
import { RefreshControl, View } from 'react-native'
import { useScrollToTop } from '@react-navigation/native'
import { router } from 'expo-router'
import { cn } from 'tailwind-variants'
import { BaseActions } from '@/components/base/actions'
import { FlashList } from '@/components/FlashList'
import { NoPatientPregnancies } from '@/components/NoPatientPregnancies'
import { PatientPregnancyCard } from '@/components/PatientPregnancyCard'
import { usePatientIdParam } from '@/hooks/usePatientIdParam'
import { usePatientPregnanciesQuery } from '@/queries/usePatientPregnanciesQuery'

export default function PatientPregnancyScreen() {
	const { id, patientId } = usePatientIdParam()
	const {
		data,
		isFetching,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		fetchNextPage,
	} = usePatientPregnanciesQuery({
		patientId,
		page: 1,
		perPage: 10,
	})

	const pregnancies = useMemo(() => {
		return (data?.pages ?? []).flatMap(page => page.data ?? [])
	}, [data?.pages])

	const listRef = useRef<any>(null)
	useScrollToTop(listRef)

	return (
		<View className="flex-1 relative">
			<FlashList
				ref={listRef}
				data={pregnancies}
				keyExtractor={item => item.id?.toString() ?? ''}
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: pregnancies.length > 0 ? 16 * 6 : 16,
					justifyContent: 'flex-end',
					paddingHorizontal: 16,
				}}
				renderItem={({ item, index }) => (
					<PatientPregnancyCard
						data={item}
						className={cn({
							'mt-1': index > 0,
							'rounded-t-3xl': index === 0,
							'rounded-b-3xl': index === pregnancies.length - 1,
						})}
						onPress={() =>
							router.push(`/patients/${id}/pregnancies/${item.id}/form`)
						}
					/>
				)}
				ListFooterComponent={() => {
					if (!pregnancies.length)
						return <NoPatientPregnancies patientId={patientId} />
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
			{pregnancies.length > 0 && (
				<BaseActions
					className="bottom-8"
					data={[
						{
							pill: true,
							prependIcon: 'plus',
							title: 'Pregnancy',
							onPress: () =>
								router.push(`/patients/${id}/pregnancies/new/form`),
						},
					]}
				/>
			)}
		</View>
	)
}
