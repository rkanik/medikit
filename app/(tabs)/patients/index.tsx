import { useMemo } from 'react'
import { RefreshControl, View } from 'react-native'
import { router } from 'expo-router'
import { cn } from 'tailwind-variants'
import { BaseActions } from '@/components/base/actions'
import { FlashList } from '@/components/FlashList'
import { NoPatients } from '@/components/NoPatients'
import { PatientCard } from '@/components/PatientCard'
import { usePatientsQuery } from '@/queries/usePatientsQuery'

export default function PatientsScreen() {
	const {
		data,
		isFetching,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		fetchNextPage,
	} = usePatientsQuery({
		page: 1,
		perPage: 10,
	})

	const patients = useMemo(() => {
		return (data?.pages ?? []).flatMap(page => page.data ?? [])
	}, [data?.pages])

	// useEffect(() => {
	// 	refetch()
	// }, [refetch])

	// const onClear = () => {
	// 	db.delete(patientsTable).execute()
	// 	refetch()
	// }
	// const onGenerate = async () => {
	// 	await db.delete(patientsTable).execute()
	// 	await db
	// 		.insert(patientsTable)
	// 		.values(
	// 			Array.from({ length: 100 }, (_, index) => ({
	// 				name: `Patient ${index + 1}`,
	// 				dob: new Date().toISOString(),
	// 				gender: 'male',
	// 				edd: new Date().toISOString(),
	// 			})),
	// 		)
	// 		.execute()
	// 	refetch()
	// }
	return (
		<View className="flex-1 relative">
			<FlashList
				data={patients}
				keyExtractor={item => item.id?.toString() ?? ''}
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: patients.length > 0 ? 16 * 6 : 16,
					justifyContent: 'flex-end',
					paddingHorizontal: 16,
				}}
				renderItem={({ item, index }) => (
					<PatientCard
						data={item}
						className={cn({
							'mt-1': index > 0,
							'rounded-t-3xl': index === 0,
							'rounded-b-3xl': index === patients.length - 1,
						})}
						onPress={() => router.push(`/patients/${item.id}`)}
					/>
				)}
				ListFooterComponent={() => {
					if (!patients.length) return <NoPatients />
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
			{patients.length > 0 && (
				<BaseActions
					className="bottom-8"
					data={[
						// {
						// 	icon: 'x',
						// 	onPress: onClear,
						// },
						// {
						// 	icon: 'list',
						// 	onPress: onGenerate,
						// },
						{
							pill: true,
							prependIcon: 'plus',
							title: 'Add Patient',
							onPress: () => router.push('/patients/new/form'),
						},
					]}
				/>
			)}
		</View>
	)
}
