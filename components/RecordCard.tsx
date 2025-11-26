import { useImageViewer } from '@/context/ImageViewerProvider'
import { TRecord } from '@/types/database'
import { cn } from '@/utils/cn'
import { $df } from '@/utils/dayjs'
import { Image } from 'expo-image'
import { useCallback, useMemo } from 'react'
import { GestureResponderEvent, Pressable, View } from 'react-native'
import { Grid, GridItem } from './ui/grid'
import { Icon, ThreeDotsIcon } from './ui/icon'
import { Text } from './ui/text'

type TRecordCardProps = {
	data: TRecord
	className?: string
	onPress?: (e: GestureResponderEvent) => void
}

export const RecordCard = ({ data, className, onPress }: TRecordCardProps) => {
	const { openImageViewer } = useImageViewer()

	const attachments = useMemo(
		() => (data.attachments ?? []).filter(v => !!v.uri),
		[data],
	)

	const onPressImage = useCallback(
		(event: GestureResponderEvent, index: number) => {
			event.stopPropagation()
			openImageViewer(attachments, index)
		},
		[attachments, openImageViewer],
	)

	return (
		<Pressable
			className={cn(
				'dark:bg-neutral-900 rounded-lg overflow-hidden p-4',
				className,
			)}
			onPress={onPress}
		>
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
				<View className="flex-none">
					<Icon as={ThreeDotsIcon} size="xl" />
				</View>
			</View>
			{attachments.length > 0 && (
				<Grid className="gap-4 mt-2" _extra={{ className: 'grid-cols-3' }}>
					{attachments.slice(0, 3).map((attachment, index) => (
						<GridItem key={index} _extra={{ className: 'col-span-1' }}>
							<Pressable
								className="relative rounded-lg overflow-hidden"
								onPress={e => onPressImage(e, index)}
							>
								<Image
									source={{ uri: attachment?.uri }}
									style={{ width: '100%', aspectRatio: 1 }}
									contentFit="cover"
									contentPosition="center"
								/>
								{attachments.length > 3 && index === 2 && (
									<View
										pointerEvents="none"
										className="absolute inset-0 bg-black/50 p-2 items-center justify-center"
									>
										<Text size="4xl">+{attachments.length - 3}</Text>
									</View>
								)}
							</Pressable>
						</GridItem>
					))}
				</Grid>
			)}
		</Pressable>
	)
}
