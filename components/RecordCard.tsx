import { useImageViewer } from '@/context/ImageViewerProvider'
import { TRecord } from '@/types/database'
import { $df } from '@/utils/dayjs'
import { Image } from 'expo-image'
import { useCallback, useMemo } from 'react'
import { GestureResponderEvent, Pressable, View } from 'react-native'
import { cn } from 'tailwind-variants'
import { BaseCard } from './base/card'
import { Grid, GridItem } from './ui/grid'
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
		<BaseCard className={cn('p-4', className)} onPress={onPress}>
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
					{/* <Icon as={ThreeDotsIcon} size="xl" /> */}
				</View>
			</View>
			{attachments.length > 0 && (
				<Grid cols={3} gap={8} className="mt-2">
					{attachments.slice(0, 3).map((attachment, index) => (
						<GridItem key={index}>
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
		</BaseCard>
	)
}
