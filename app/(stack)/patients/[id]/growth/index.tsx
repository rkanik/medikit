import { useMemo, useRef } from 'react'
import { RefreshControl, View } from 'react-native'
import { useScrollToTop } from '@react-navigation/native'
import { router } from 'expo-router'
import { cn } from 'tailwind-variants'
import { BaseActions } from '@/components/base/actions'
import { FlashList } from '@/components/FlashList'
import { NoPatientTimeline } from '@/components/NoPatientTimeline'
import { PatientTimelineCard } from '@/components/PatientTimelineCard'
import { usePatientIdParam } from '@/hooks/usePatientIdParam'
import { usePatientByIdQuery } from '@/queries/usePatientByIdQuery'
import { usePatientTimelineQuery } from '@/queries/usePatientTimelineQuery'

export default function PatientGrowthScreen() {
	const { id, patientId } = usePatientIdParam()
	const { data: patient } = usePatientByIdQuery(patientId)
	const {
		data,
		isFetching,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		fetchNextPage,
	} = usePatientTimelineQuery({
		patientId,
		page: 1,
		perPage: 10,
	})

	const timelineData = useMemo(() => {
		return (data?.pages ?? []).flatMap(page => page.data ?? [])
	}, [data?.pages])

	const listRef = useRef<any>(null)
	useScrollToTop(listRef)

	return (
		<View className="flex-1 relative">
			<FlashList
				ref={listRef}
				data={timelineData}
				keyExtractor={item => item.id?.toString() ?? ''}
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: timelineData.length > 0 ? 16 * 6 : 16,
					justifyContent: 'flex-end',
					paddingHorizontal: 16,
				}}
				renderItem={({ item, index }) => (
					<PatientTimelineCard
						data={item}
						previous={timelineData[index + 1]}
						dob={patient?.dob}
						gender={patient?.gender}
						isFirst={index === 0}
						isLast={index === timelineData.length - 1}
						className={cn({
							'mt-1': index > 0,
							'rounded-t-3xl': index === 0,
							'rounded-b-3xl': index === timelineData.length - 1,
						})}
						onPress={() =>
							router.push(`/patients/${id}/growth/${item.id}/form`)
						}
					/>
				)}
				ListFooterComponent={() => {
					if (!timelineData.length)
						return <NoPatientTimeline patientId={patientId} />
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
			{timelineData.length > 0 && (
				<BaseActions
					className="bottom-8"
					data={[
						{
							pill: true,
							prependIcon: 'plus',
							title: 'Growth',
							onPress: () =>
								router.push(`/patients/${id}/growth/new/form`),
						},
					]}
				/>
			)}
		</View>
	)
}
