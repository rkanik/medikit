import type { TPatientPregnancy } from '@/types/database'
import type { GestureResponderEvent } from 'react-native'
import { useMemo } from 'react'
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
import { Text, Title } from './ui/text'

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
	const father = data.father

	const currentlyPregnant = isCurrentlyPregnant(data)
	const weeksAtDelivery =
		data.expectedDate && data.deliveryDate
			? gestationalAgeFromEdd(data.expectedDate, data.deliveryDate)
			: null
	const weeksRunning =
		currentlyPregnant && data.expectedDate
			? gestationalAgeFromEdd(data.expectedDate)
			: null

	const headline = useMemo(() => {
		if (currentlyPregnant && weeksRunning) {
			return formatGestationalAge(weeksRunning)
		}
		if (data.deliveryDate && weeksAtDelivery) {
			return formatGestationalAge(weeksAtDelivery)
		}
		if (data.deliveryDate) return 'Delivered'
		if (data.expectedDate) return 'Expected'
		return 'Pregnancy'
	}, [
		currentlyPregnant,
		data.deliveryDate,
		data.expectedDate,
		weeksAtDelivery,
		weeksRunning,
	])

	const headlineHint = useMemo(() => {
		if (currentlyPregnant) return 'Gestational age'
		if (data.deliveryDate && weeksAtDelivery) return 'Length of pregnancy'
		if (data.deliveryDate) return 'Outcome'
		return null
	}, [currentlyPregnant, data.deliveryDate, weeksAtDelivery])

	const hasPeople = !!father || children.length > 0
	const hasDates = !!data.expectedDate || !!data.deliveryDate

	return (
		<BaseCard onPress={onPress} className={cn('p-5', className)}>
			<View className="flex-row items-start justify-between gap-3">
				<View className="flex-1">
					{headlineHint ? (
						<Text className="text-xs uppercase tracking-wide opacity-60">
							{headlineHint}
						</Text>
					) : null}
					<Title className="text-2xl mt-0.5">{headline}</Title>
				</View>
				{currentlyPregnant ? (
					<Badge
						text="Pregnant"
						className="bg-green-500 dark:bg-green-600"
						textClassName="text-sm text-white"
					/>
				) : data.deliveryDate ? (
					<Badge
						text="Delivered"
						className="bg-neutral-500 dark:bg-neutral-600"
						textClassName="text-sm text-white"
					/>
				) : null}
			</View>

			{hasDates ? (
				<View className="mt-4 flex-row gap-3">
					{data.expectedDate ? (
						<View className="flex-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 px-3 py-3">
							<Text className="text-xs uppercase tracking-wide opacity-60">
								Due
							</Text>
							<Text className="mt-1 text-base font-medium">
								{$df(data.expectedDate, 'DD MMM, YYYY')}
							</Text>
						</View>
					) : null}
					{data.deliveryDate ? (
						<View className="flex-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 px-3 py-3">
							<Text className="text-xs uppercase tracking-wide opacity-60">
								Born
							</Text>
							<Text className="mt-1 text-base font-medium">
								{$df(data.deliveryDate, 'DD MMM, YYYY')}
							</Text>
						</View>
					) : null}
				</View>
			) : null}

			{hasPeople ? (
				<View className="mt-4 gap-3">
					{father ? (
						<View>
							<Text className="mb-2 text-xs uppercase tracking-wide opacity-60">
								Father
							</Text>
							<View className="flex-row flex-wrap gap-2">
								<View className="flex-row items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-900 py-1.5 pl-1.5 pr-3">
									<Avatar
										variant="secondary"
										className="h-7 w-7"
										textClassName="text-xs"
										text={father.name}
										image={paths.document(father.avatar?.uri)}
									/>
									<Text className="text-sm font-medium" numberOfLines={1}>
										{father.name}
									</Text>
								</View>
							</View>
						</View>
					) : null}

					{children.length > 0 ? (
						<View>
							<Text className="mb-2 text-xs uppercase tracking-wide opacity-60">
								{children.length === 1 ? 'Baby' : 'Babies'}
							</Text>
							<View className="flex-row flex-wrap gap-2">
								{children.map(child => (
									<View
										key={child!.id}
										className="flex-row items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-900 py-1.5 pl-1.5 pr-3"
									>
										<Avatar
											variant="secondary"
											className="h-7 w-7"
											textClassName="text-xs"
											text={child!.name}
											image={paths.document(child!.avatar?.uri)}
										/>
										<Text className="text-sm font-medium" numberOfLines={1}>
											{child!.name}
										</Text>
									</View>
								))}
							</View>
						</View>
					) : null}
				</View>
			) : null}
		</BaseCard>
	)
}
