import type { TRecordsQuery } from '@/queries/useRecordsQuery'
import { Fragment, useMemo } from 'react'
import { RefreshControl, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { cn } from 'tailwind-variants'
import { FlashList } from '@/components/FlashList'
import { NoRecords } from '@/components/NoRecords'
import { RecordCard } from '@/components/RecordCard'
import { useRecordsQuery } from '@/queries/useRecordsQuery'

export default function Screen() {
	const { name } = useLocalSearchParams<{
		name: string
	}>()

	const decodedName = decodeURIComponent(name)

	const query = useMemo<TRecordsQuery>(
		() => ({
			tag: decodedName,
		}),
		[decodedName],
	)
	//
	const {
		data,
		refetch,
		isFetching,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = useRecordsQuery({
		...query,
		page: 1,
		perPage: 10,
	})

	return (
		<Fragment>
			<Stack.Screen options={{ title: decodedName }} />
			<View className="flex-1">
				<FlashList
					data={data}
					keyExtractor={item => item.id?.toString() ?? ''}
					contentContainerStyle={{
						flexGrow: 1,
						paddingBottom: 16,
						justifyContent: 'flex-end',
						paddingHorizontal: 16,
					}}
					ListFooterComponent={() => {
						if (!data.length) return <NoRecords />
						return null
					}}
					renderItem={({ item, index }) => (
						<RecordCard
							data={item}
							className={cn({
								'mt-1': index > 0,
								'rounded-t-3xl': index === 0,
								'rounded-b-3xl': index === data.length - 1,
							})}
							onPress={() =>
								item.id != null && router.push(`/records/${item.id}`)
							}
						/>
					)}
					refreshControl={
						<RefreshControl refreshing={isFetching} onRefresh={refetch} />
					}
					onEndReached={() => {
						if (hasNextPage && !isFetchingNextPage) {
							fetchNextPage()
						}
					}}
				/>
			</View>
		</Fragment>
	)
}
