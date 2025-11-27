import { api } from '@/api'
import { BaseActions } from '@/components/base/actions'
import { BaseImage } from '@/components/base/image'
import { Text } from '@/components/ui/text'
import { useImageViewer } from '@/context/ImageViewerProvider'
import { $df } from '@/utils/dayjs'
// import { Image } from 'expo-image'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { EditIcon, Trash2Icon } from 'lucide-react-native'
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
		<Fragment>
			<Stack.Screen options={{ title: 'Record Details' }} />
			<View className="flex-1 relative">
				<ScrollView contentContainerClassName="px-4 pb-28">
					<View className="flex-row justify-between">
						<View className="flex-1 gap-1">
							<Text className="uppercase text-sm opacity-75">
								{$df(data.date, 'DD MMM, YYYY')} | {data.type}
							</Text>
							<Text className="text-lg">{data.text}</Text>
							{data.amount > 0 && (
								<Text bold className="text-green-500">
									{data.amount} TK
								</Text>
							)}
						</View>
						<View className="flex-none"></View>
					</View>
					<View className="mt-4 gap-4">
						{attachments.map((attachment, index) => (
							<BaseImage
								key={index}
								uri={attachment?.uri}
								onPress={e => onPressImage(e, index)}
							/>
						))}
					</View>
				</ScrollView>
				<BaseActions
					className="bottom-8"
					data={[
						{ icon: Trash2Icon, onPress: onDelete },
						{
							icon: EditIcon,
							text: 'Update',
							onPress: () => router.push(`/records/${id}/form`),
						},
					]}
				/>
			</View>
		</Fragment>
	)
}
