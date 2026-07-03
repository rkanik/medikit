import type { TRecordsQuery } from '@/queries/useRecordsQuery'
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { RefreshControl, ToastAndroid, View } from 'react-native'
import { launchScanner } from '@dariyd/react-native-document-scanner'
import { useScrollToTop } from '@react-navigation/native'
import { router } from 'expo-router'
import { cn } from 'tailwind-variants'
import { useCurrentPatient } from '@/api/patients'
import { BaseActions } from '@/components/base/actions'
import { FlashList } from '@/components/FlashList'
import { NoPatients } from '@/components/NoPatients'
import { NoRecords } from '@/components/NoRecords'
import { PatientCard } from '@/components/PatientCard'
import { RecordCard } from '@/components/RecordCard'
import { RecordsSummary } from '@/components/RecordsSummary'
import { Input } from '@/components/ui/input'
import { Title } from '@/components/ui/text'
import { useApp } from '@/context/AppContext'
import { usePatientsListQuery } from '@/queries/usePatientsListQuery'
import { useRecordsQuery } from '@/queries/useRecordsQuery'
import { saveToDownloads } from '@/utils/saveToDownloads'
import { shareFiles } from '@/utils/shareFiles'

export default function Screen() {
	const [q, setQ] = useState('')
	const [selecting, setSelecting] = useState(false)
	const [selectedIds, setSelectedIds] = useState<number[]>([])
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

	const clearSelection = useCallback(() => {
		setSelecting(false)
		setSelectedIds([])
	}, [])

	const toggleSelection = useCallback((id: number) => {
		setSelectedIds(prev => {
			const next = prev.includes(id)
				? prev.filter(value => value !== id)
				: [...prev, id]
			if (!next.length) {
				setSelecting(false)
			}
			return next
		})
	}, [])

	const onLongPressRecord = useCallback((id: number) => {
		setSelecting(true)
		setSelectedIds(prev => (prev.includes(id) ? prev : [...prev, id]))
	}, [])

	const selectedAttachments = useMemo(() => {
		return data
			.filter(record => record.id != null && selectedIds.includes(record.id))
			.flatMap(record =>
				(record.attachments ?? [])
					.map(attachment => attachment.uri)
					.filter(Boolean),
			) as string[]
	}, [data, selectedIds])

	const onShareSelected = useCallback(async () => {
		if (!selectedAttachments.length) return

		try {
			await shareFiles(selectedAttachments)
		} catch {
			ToastAndroid.show('Failed to share files', ToastAndroid.SHORT)
		}
	}, [selectedAttachments])

	const onDownloadSelected = useCallback(async () => {
		if (!selectedAttachments.length) return

		const results = await Promise.allSettled(
			selectedAttachments.map(uri => saveToDownloads(uri)),
		)
		const savedCount = results.filter(
			result => result.status === 'fulfilled',
		).length
		const failedCount = results.length - savedCount

		if (failedCount > 0 && savedCount === 0) {
			ToastAndroid.show('Failed to save to Downloads', ToastAndroid.SHORT)
			return
		}

		if (savedCount > 0) {
			ToastAndroid.show(
				savedCount === 1
					? 'Saved to Downloads'
					: `Saved ${savedCount} to Downloads`,
				ToastAndroid.SHORT,
			)
		}
	}, [selectedAttachments])

	const { data: patients } = usePatientsListQuery()

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
					if (!patients.length) return <NoPatients />
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
						selected={item.id != null && selectedIds.includes(item.id)}
						selecting={selecting}
						onLongPress={() => item.id != null && onLongPressRecord(item.id)}
						onPress={() => {
							if (!item.id) return
							if (selecting) {
								toggleSelection(item.id)
								return
							}
							router.push(`/records/${item.id}`)
						}}
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
				data={
					selecting
						? [
								{
									pill: true,
									size: 'icon',
									prependIcon: 'x',
									variant: 'destructive',
									onPress: clearSelection,
								},
								{
									pill: true,
									size: 'icon',
									variant: 'primary',
									prependIcon: 'share-2',
									disabled: !selectedAttachments.length,
									onPress: onShareSelected,
								},
								{
									pill: true,
									size: 'icon',
									variant: 'primary',
									prependIcon: 'download',
									disabled: !selectedAttachments.length,
									onPress: onDownloadSelected,
								},
							]
						: data.length
							? [
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
										prependIconClassName: 'text-2xl',
										onPress: onScan,
									},
								]
							: []
				}
			/>
		</View>
	)
}
