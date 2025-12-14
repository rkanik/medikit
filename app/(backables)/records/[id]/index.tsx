import { api } from '@/api'
import { BaseActions } from '@/components/base/actions'
import { BaseCard } from '@/components/base/card'
import { BaseImage } from '@/components/base/image'
import { Grid, GridItem } from '@/components/ui/grid'
import { Pressable } from '@/components/ui/pressable'
import { Subtitle, Text, Title } from '@/components/ui/text'
import { useImageViewer } from '@/context/ImageViewerProvider'
import { $df } from '@/utils/dayjs'
// import { Image } from 'expo-image'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Fragment, useCallback, useMemo } from 'react'
import { Alert, GestureResponderEvent, ScrollView, View } from 'react-native'

export default function Screen() {
	const { id } = useLocalSearchParams()

	const { data, remove } = api.records.useRecordById(Number(id))

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
					<Subtitle className="uppercase text-sm">
						{$df(data.date, 'DD MMM, YYYY')} | {data.type}
					</Subtitle>
					<Title>{data.text}</Title>
					{data.amount > 0 && (
						<Text className="font-bold text-green-500 dark:text-green-300">
							{data.amount} TK
						</Text>
					)}
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
