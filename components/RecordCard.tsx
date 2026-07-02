import type { TRecord } from '@/types/database'
import type { GestureResponderEvent, ViewProps } from 'react-native'
import { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'
import { useImageViewer } from '@/context/ImageViewerProvider'
import { $df } from '@/utils/dayjs'
import { paths } from '@/utils/paths'
import { BaseCard } from './base/card'
import { BaseImage } from './base/image'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import { Grid, GridItem } from './ui/grid'
import { Icon } from './ui/icon'
import { Pressable } from './ui/pressable'
import { Subtitle, Text, Title } from './ui/text'

export const RecordCardHeader = ({
	data,
	...props
}: ViewProps & {
	data: Pick<TRecord, 'date' | 'text' | 'amount' | 'tags' | 'patient'>
}) => {
	return (
		<View {...props}>
			<View className="flex-row items-center gap-2">
				{data.patient && (
					<Avatar
						image={paths.document(data.patient.avatar?.uri)}
						className="w-7 h-7"
					/>
				)}
				<View className="flex-1">
					{data.patient && <Subtitle>{data.patient.name}</Subtitle>}
					<Subtitle className="text-xs text-secondary-foreground">
						<Icon name="calendar" className="text-secondary-foreground" />{' '}
						{$df(data.date, 'DD MMM, YYYY')}
					</Subtitle>
				</View>
				{data.amount > 0 && (
					<Text className="font-bold text-green-500 dark:text-green-300 flex-none ml-auto">
						{data.amount} TK
					</Text>
				)}
			</View>
			{data.text && <Title>{data.text}</Title>}
			{!!data.tags?.length && (
				<View className="flex-row flex-wrap gap-1 mt-2">
					{data.tags.map((tag, index) => (
						<Badge key={index} text={tag} />
					))}
				</View>
			)}
		</View>
	)
}

export type TRecordCardProps = {
	data: TRecord
	className?: string
	showPatient?: boolean
	onPress?: (e: GestureResponderEvent) => void
}

export const RecordCard = ({
	data,
	className,
	showPatient,
	onPress,
}: TRecordCardProps) => {
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
			<RecordCardHeader data={data} />
			{attachments.length > 0 && (
				<Grid cols={3} gap={8} className="mt-2">
					{attachments.slice(0, 3).map((attachment, index) => (
						<GridItem key={index}>
							<Pressable
								className="rounded-lg aspect-square overflow-hidden border border-neutral-200 dark:border-neutral-700"
								onPress={e => {
									if (attachments.length > 3 && index === 2) {
										return onPress?.(e)
									}
									onPressImage(e, index)
								}}
							>
								<BaseImage uri={attachment?.uri} aspectRatio={1} />
								{attachments.length > 3 && index === 2 && (
									<View
										pointerEvents="none"
										className="absolute inset-0 bg-black/50 p-2 items-center justify-center"
									>
										<Text className="text-4xl text-white">
											+{attachments.length - 3}
										</Text>
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
