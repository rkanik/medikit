import { usePatient } from '@/api/patients'
import { useImageViewer } from '@/context/ImageViewerProvider'
import { TRecord } from '@/types/database'
import { $df } from '@/utils/dayjs'
import { useCallback, useMemo } from 'react'
import { GestureResponderEvent, View } from 'react-native'
import { cn } from 'tailwind-variants'
import { BaseCard } from './base/card'
import { BaseImage } from './base/image'
import { Avatar } from './ui/avatar'
import { Divider } from './ui/divider'
import { Grid, GridItem } from './ui/grid'
import { Pressable } from './ui/pressable'
import { Subtitle, Text, Title } from './ui/text'

type TRecordCardPatientProps = {
	patientId: number
}

export const RecordCardPatient = ({ patientId }: TRecordCardPatientProps) => {
	const { data: patient } = usePatient(patientId)
	return (
		<View>
			<View className="flex-row items-center gap-2">
				<Avatar image={patient?.avatar?.uri} className="w-6 h-6" />
				<Subtitle>{patient?.name}</Subtitle>
			</View>
			<Divider className="my-2" />
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
			{showPatient && <RecordCardPatient patientId={data.patientId} />}
			<View className="flex-row justify-between">
				<View className="flex-1 gap-1">
					<Subtitle className="uppercase text-sm">
						{$df(data.date, 'DD MMM, YYYY')} | {data.type}
					</Subtitle>
					<Title>{data.text}</Title>
					{data.amount > 0 && (
						<Text className="font-bold text-green-500 dark:text-green-300">
							{data.amount} TK
						</Text>
					)}
				</View>
				<View className="flex-none"></View>
			</View>
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
