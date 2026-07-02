import type { GestureResponderEvent } from 'react-native'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { Alert, ScrollView, ToastAndroid, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { cn } from 'tailwind-variants'
import { BaseActions } from '@/components/base/actions'
import { BaseCard } from '@/components/base/card'
import { BaseImage } from '@/components/base/image'
import { RecordCardHeader } from '@/components/RecordCard'
import { Grid, GridItem } from '@/components/ui/grid'
import { Icon } from '@/components/ui/icon'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { useImageViewer } from '@/context/ImageViewerProvider'
import { useDeleteRecordsMutation } from '@/mutations/useDeleteRecordsMutation'
import { useRecordByIdQuery } from '@/queries/useRecordByIdQuery'
import { useInvalidateRecordsQuery } from '@/queries/useRecordsQuery'
import { saveToDownloads } from '@/utils/saveToDownloads'
import { shareFiles } from '@/utils/shareFiles'

export default function Screen() {
	const { id } = useLocalSearchParams()

	const { data } = useRecordByIdQuery(Number(id))
	const { mutate: deleteRecord } = useDeleteRecordsMutation()
	const invalidateRecordsQuery = useInvalidateRecordsQuery()

	const onDelete = useCallback(() => {
		Alert.alert(
			'Delete Record',
			'Are you sure you want to delete this record?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					onPress() {
						deleteRecord(Number(id), {
							onSuccess() {
								invalidateRecordsQuery()
								router.back()
							},
						})
					},
				},
			],
		)
	}, [deleteRecord, id, invalidateRecordsQuery])

	const attachments = useMemo(
		() => (data?.attachments ?? []).filter(v => !!v.uri),
		[data],
	)

	const [selecting, setSelecting] = useState(false)
	const [selectedIndexes, setSelectedIndexes] = useState<number[]>([])

	const clearSelection = useCallback(() => {
		setSelecting(false)
		setSelectedIndexes([])
	}, [])

	const toggleSelection = useCallback((index: number) => {
		setSelectedIndexes(prev => {
			const next = prev.includes(index)
				? prev.filter(value => value !== index)
				: [...prev, index]
			if (!next.length) {
				setSelecting(false)
			}
			return next
		})
	}, [])

	const onLongPressAttachment = useCallback((index: number) => {
		setSelecting(true)
		setSelectedIndexes(prev => (prev.includes(index) ? prev : [...prev, index]))
	}, [])

	const { openImageViewer } = useImageViewer()
	const onPressImage = useCallback(
		(event: GestureResponderEvent, index: number) => {
			event.stopPropagation()
			openImageViewer(attachments, index)
		},
		[attachments, openImageViewer],
	)

	const onPressAttachment = useCallback(
		(event: GestureResponderEvent, index: number) => {
			if (selecting) {
				event.stopPropagation()
				toggleSelection(index)
				return
			}
			onPressImage(event, index)
		},
		[selecting, toggleSelection, onPressImage],
	)

	const onShareSelected = useCallback(async () => {
		const selected = selectedIndexes
			.map(index => attachments[index]?.uri)
			.filter(Boolean) as string[]
		if (!selected.length) return

		try {
			await shareFiles(selected)
		} catch {
			ToastAndroid.show('Failed to share files', ToastAndroid.SHORT)
		}
	}, [attachments, selectedIndexes])

	const onDownloadSelected = useCallback(async () => {
		const selected = selectedIndexes
			.map(index => attachments[index]?.uri)
			.filter(Boolean) as string[]
		if (!selected.length) return

		const results = await Promise.allSettled(
			selected.map(uri => saveToDownloads(uri)),
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
	}, [attachments, selectedIndexes])

	if (!data) {
		return (
			<Fragment>
				<Stack.Screen options={{ title: 'Not Found!' }} />
				<View className="flex-1 px-5">
					<Text>Record not found!</Text>
				</View>
			</Fragment>
		)
	}

	return (
		<View className="flex-1">
			<Stack.Screen options={{ title: 'Record Details' }} />
			<ScrollView
				contentContainerClassName="px-4 pb-32 justify-end"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<BaseCard>
					<RecordCardHeader data={data} />
				</BaseCard>
				<Grid cols={attachments.length > 1 ? 2 : 1} gap={16} className="mt-4">
					{attachments.map((attachment, index) => {
						const selected = selectedIndexes.includes(index)
						return (
							<GridItem key={attachment.id ?? index}>
								<Pressable
									className={cn(
										'rounded-lg overflow-hidden border',
										selected
											? 'border-green-500 dark:border-green-300 border-2'
											: 'border-neutral-200 dark:border-neutral-700',
									)}
									onPress={e => onPressAttachment(e, index)}
									onLongPress={() => onLongPressAttachment(index)}
								>
									<BaseImage uri={attachment?.uri} aspectRatio={1} />
									{selected && (
										<View className="absolute right-2 top-2 bg-green-500 rounded-full size-6 items-center justify-center">
											<Icon name="check" className="text-white" />
										</View>
									)}
								</Pressable>
							</GridItem>
						)
					})}
				</Grid>
			</ScrollView>
			<BaseActions
				className="bottom-12"
				data={
					selecting
						? [
								{
									pill: true,
									size: 'icon',
									prependIcon: 'x',
									onPress: clearSelection,
								},
								{
									pill: true,
									size: 'icon',
									prependIcon: 'share-2',
									disabled: !selectedIndexes.length,
									onPress: onShareSelected,
								},
								{
									pill: true,
									size: 'icon',
									prependIcon: 'download',
									disabled: !selectedIndexes.length,
									onPress: onDownloadSelected,
								},
							]
						: [
								{
									pill: true,
									variant: 'destructive',
									size: 'icon',
									prependIcon: 'trash',
									onPress: onDelete,
								},
								{
									pill: true,
									prependIcon: 'edit',
									title: 'Update',
									onPress: () => router.push(`/records/${id}/form`),
								},
							]
				}
			/>
		</View>
	)
}
