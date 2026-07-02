import type { TRecordsQuery } from '@/queries/useRecordsQuery'
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { RefreshControl, View } from 'react-native'
import { launchScanner } from '@dariyd/react-native-document-scanner'
import { useScrollToTop } from '@react-navigation/native'
import { router } from 'expo-router'
import { cn } from 'tailwind-variants'
import { useCurrentPatient } from '@/api/patients'
import { BaseActions } from '@/components/base/actions'
import { FlashList } from '@/components/FlashList'
import { NoRecords } from '@/components/NoRecords'
import { PatientCard } from '@/components/PatientCard'
import { RecordCard } from '@/components/RecordCard'
import { RecordsSummary } from '@/components/RecordsSummary'
import { Input } from '@/components/ui/input'
import { Title } from '@/components/ui/text'
import { useApp } from '@/context/AppContext'
import { useRecordsQuery } from '@/queries/useRecordsQuery'

export default function Screen() {
	const [q, setQ] = useState('')
	const listRef = useRef<any>(null)
	const { data: currentPatient } = useCurrentPatient()
	useScrollToTop(listRef)

	const query = useMemo<TRecordsQuery>(() => {
		return {
			q,
			patientId: currentPatient?.id,
		}
	}, [q, currentPatient?.id])

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

	const { isSearching, setPendingRecordAttachments } = useApp()
	useEffect(() => {
		if (!isSearching) {
			setQ('')
		}
	}, [isSearching])

	const onScan = useCallback(async () => {
		const result = await launchScanner({ quality: 1, includeBase64: false })
		if (!result.images?.length) return
		setPendingRecordAttachments(
			result.images.map(image => ({
				uri: image.uri,
			})),
		)
		router.push('/records/new/form')
	}, [setPendingRecordAttachments])

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
			<FlashList
				ref={listRef}
				data={data}
				keyExtractor={item => item.id?.toString() ?? ''}
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: data.length > 0 ? 16 * 7 : 16,
					justifyContent: 'flex-end',
					paddingHorizontal: 16,
				}}
				ListHeaderComponent={() => {
					if (!data.length) return null
					return (
						<Fragment>
							{currentPatient && (
								<View className="gap-2 mb-4">
									<Title>Patient</Title>
									<PatientCard
										data={currentPatient}
										onPress={() =>
											router.push(`/patients/${currentPatient.id}`)
										}
									/>
								</View>
							)}
							<RecordsSummary query={query} />
							<Title className="mt-4 mb-2">Records</Title>
						</Fragment>
					)
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
						showPatient={!currentPatient}
						onPress={() => router.push(`/records/${item.id}`)}
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
			<BaseActions
				className="bottom-8"
				data={[
					{
						pill: true,
						prependIcon: 'plus',
						title: 'Add Record',
						onPress: () => router.push('/records/new/form'),
					},
					{
						pill: true,
						size: 'icon',
						prependIcon: 'camera',
						prependIconClassName: 'text-xl',
						onPress: onScan,
					},
				]}
			/>
		</View>
	)
}
