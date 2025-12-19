import type { GestureResponderEvent } from 'react-native'

import { Fragment, useCallback, useMemo } from 'react'
import { Alert, ScrollView, View } from 'react-native'

import { router, Stack, useLocalSearchParams } from 'expo-router'

import { useRecordById } from '@/api/records'
import { BaseActions } from '@/components/base/actions'
import { BaseCard } from '@/components/base/card'
import { BaseImage } from '@/components/base/image'
import { RecordCardHeader } from '@/components/RecordCard'
import { Grid, GridItem } from '@/components/ui/grid'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { useImageViewer } from '@/context/ImageViewerProvider'

export default function Screen() {
	const { id } = useLocalSearchParams()

	const { data, remove } = useRecordById(Number(id))

	const onDelete = useCallback(() => {
		Alert.alert(
			'Delete Record',
			'Are you sure you want to delete this record?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					onPress() {
						remove()
						router.back()
					},
				},
			],
		)
	}, [remove])

	const attachments = useMemo(
		() => (data?.attachments ?? []).filter(v => !!v.uri),
		[data],
	)

	const { openImageViewer } = useImageViewer()
	const onPressImage = useCallback(
		(event: GestureResponderEvent, index: number) => {
			event.stopPropagation()
			openImageViewer(attachments, index)
		},
		[attachments, openImageViewer],
	)

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
					{attachments.map((attachment, index) => (
						<GridItem key={index}>
							<Pressable
								className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
								onPress={e => onPressImage(e, index)}
							>
								<BaseImage uri={attachment?.uri} aspectRatio={1} />
							</Pressable>
						</GridItem>
					))}
				</Grid>
			</ScrollView>
			<BaseActions
				className="bottom-12"
				data={[
					{ icon: 'trash', onPress: onDelete },
					{
						icon: 'edit',
						text: 'Update',
						onPress: () => router.push(`/records/${id}/form`),
					},
				]}
			/>
		</View>
	)
}
