import type { TPatientPregnancy } from '@/types/database'
import type { GestureResponderEvent } from 'react-native'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'
import { $df } from '@/utils/dayjs'
import { paths } from '@/utils/paths'
import {
	formatGestationalAge,
	gestationalAgeFromEdd,
	isCurrentlyPregnant,
} from '@/utils/pregnancy'
import { BaseCard } from './base/card'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import { Subtitle, Text, Title } from './ui/text'

type TPatientPregnancyCardProps = {
	data: TPatientPregnancy
	className?: string
	onPress?: (e: GestureResponderEvent) => void
}

export const PatientPregnancyCard = ({
	data,
	className,
	onPress,
}: TPatientPregnancyCardProps) => {
	const children = (data.children ?? [])
		.map(link => link.child)
		.filter(Boolean)

	const currentlyPregnant = isCurrentlyPregnant(data)
	const weeksAtDelivery =
		data.expectedDate && data.deliveryDate
			? gestationalAgeFromEdd(data.expectedDate, data.deliveryDate)
			: null
	const weeksRunning =
		currentlyPregnant && data.expectedDate
			? gestationalAgeFromEdd(data.expectedDate)
			: null

	return (
		<BaseCard onPress={onPress} className={cn('p-5', className)}>
			<View className="flex-row items-start justify-between gap-2">
				<Title className="flex-1">
					{data.expectedDate
						? `EDD ${$df(data.expectedDate, 'DD MMM, YYYY')}`
						: data.deliveryDate
							? `Delivered ${$df(data.deliveryDate, 'DD MMM, YYYY')}`
							: 'Pregnancy'}
				</Title>
				{currentlyPregnant ? (
					<Badge
						text="Pregnant"
						className="bg-green-500 dark:bg-green-600"
						textClassName="text-sm text-white"
					/>
				) : null}
			</View>

			<View className="mt-2 gap-1">
				{data.deliveryDate ? (
					<Subtitle>
						Delivered: {$df(data.deliveryDate, 'DD MMM, YYYY')}
					</Subtitle>
				) : null}
				{weeksAtDelivery ? (
					<Subtitle>
						Pregnancy lasted {formatGestationalAge(weeksAtDelivery)}
					</Subtitle>
				) : null}
				{weeksRunning ? (
					<Subtitle>
						Running {formatGestationalAge(weeksRunning)}
					</Subtitle>
				) : null}
			</View>

			{children.length > 0 ? (
				<View className="mt-3 flex-row flex-wrap gap-2">
					{children.map(child => (
						<View key={child!.id} className="flex-row items-center gap-2">
							<Avatar
								className="h-7 w-7"
								text={child!.name}
								image={paths.document(child!.avatar?.uri)}
							/>
							<Text className="text-sm">{child!.name}</Text>
						</View>
					))}
				</View>
			) : null}
		</BaseCard>
	)
}
