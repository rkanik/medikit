import type { TPatientTimelineEntry } from '@/types/database'
import type { GestureResponderEvent } from 'react-native'
import { useMemo } from 'react'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'
import { TIMELINE_METRICS } from '@/const/timelineMetrics'
import { $df } from '@/utils/dayjs'
import {
	formatPercentChange,
	formatSincePrevious,
	getGrowthIdeal,
	percentChange,
} from '@/utils/growthIdeals'
import { BaseCard } from './base/card'
import { Body, Subtitle, Text, Title } from './ui/text'

type TPatientTimelineCardProps = {
	data: TPatientTimelineEntry
	previous?: TPatientTimelineEntry | null
	dob?: string | null
	gender?: string | null
	className?: string
	isFirst?: boolean
	isLast?: boolean
	onPress?: (e: GestureResponderEvent) => void
}

const getMetricNumber = (
	entry: TPatientTimelineEntry | null | undefined,
	key: string,
) => {
	const raw = entry?.values?.find(item => item.key === key)?.value
	if (raw == null || raw === '') return null
	const num = Number(raw)
	return Number.isFinite(num) ? num : null
}

export const PatientTimelineCard = ({
	data,
	previous,
	dob,
	gender,
	className,
	isFirst,
	isLast,
	onPress,
}: TPatientTimelineCardProps) => {
	const height = getMetricNumber(data, 'height')
	const weight = getMetricNumber(data, 'weight')
	const prevHeight = getMetricNumber(previous, 'height')
	const prevWeight = getMetricNumber(previous, 'weight')

	const sincePrevious = useMemo(() => {
		if (!previous?.date) return null
		return formatSincePrevious(data.date, previous.date)
	}, [data.date, previous?.date])

	const heightChange = formatPercentChange(
		height != null && prevHeight != null
			? percentChange(height, prevHeight)
			: null,
	)
	const weightChange = formatPercentChange(
		weight != null && prevWeight != null
			? percentChange(weight, prevWeight)
			: null,
	)

	const ideal = useMemo(
		() =>
			getGrowthIdeal({
				dob,
				atDate: data.date,
				gender,
				heightFt: height,
			}),
		[dob, data.date, gender, height],
	)

	const extraMetrics = (data.values ?? []).filter(
		item =>
			!!item.value?.trim() &&
			!TIMELINE_METRICS.some(metric => metric.key === item.key),
	)

	const changeClass = (label: string | null) => {
		if (!label) return ''
		if (label.startsWith('+')) return 'text-green-600 dark:text-green-400'
		if (label.startsWith('-')) return 'text-red-600 dark:text-red-400'
		return 'text-neutral-500'
	}

	return (
		<View className="flex-row">
			<View className="w-16 items-center justify-center self-stretch">
				{!(isFirst && isLast) ? (
					<View
						className="absolute w-1 bg-primary"
						style={{
							top: isFirst ? '50%' : 0,
							bottom: isLast ? '50%' : 0,
						}}
					/>
				) : null}
				<View className="z-10 h-14 w-14 items-center justify-center rounded-full border-[3px] border-white bg-primary dark:border-neutral-900">
					<Text className="text-lg font-bold leading-5 text-primary-foreground">
						{$df(data.date, 'DD')}
					</Text>
					<Text className="text-[10px] font-semibold uppercase leading-3 text-primary-foreground/90">
						{$df(data.date, 'MMM')}
					</Text>
				</View>
			</View>
			<BaseCard
				onPress={onPress}
				className={cn('ml-2 flex-1 p-5', className)}
			>
				<View className="flex-row items-baseline justify-between gap-2">
					<Text className="text-sm opacity-70 dark:opacity-80">
						{$df(data.date, 'DD MMM, YYYY')}
					</Text>
					{sincePrevious ? (
						<Text className="text-xs opacity-60">{sincePrevious}</Text>
					) : null}
				</View>

				{(height != null || weight != null) && (
					<View className="mt-2 flex-row gap-6">
						{height != null && (
							<View className="flex-1">
								<Text className="text-xs uppercase tracking-wide opacity-60">
									Height
								</Text>
								<Title className="text-2xl">
									{height}{' '}
									<Text className="text-base font-normal opacity-70">ft</Text>
								</Title>
								{heightChange ? (
									<Text
										className={cn('mt-0.5 text-sm', changeClass(heightChange))}
									>
										{heightChange} from prev
									</Text>
								) : null}
							</View>
						)}
						{weight != null && (
							<View className="flex-1">
								<Text className="text-xs uppercase tracking-wide opacity-60">
									Weight
								</Text>
								<Title className="text-2xl">
									{weight}{' '}
									<Text className="text-base font-normal opacity-70">kg</Text>
								</Title>
								{weightChange ? (
									<Text
										className={cn('mt-0.5 text-sm', changeClass(weightChange))}
									>
										{weightChange} from prev
									</Text>
								) : null}
							</View>
						)}
					</View>
				)}

				{ideal && (ideal.heightFt != null || ideal.weightKg != null) ? (
					<Body className="mt-2 text-sm">
						Ideal
						{ideal.heightFt != null ? ` height ~${ideal.heightFt} ft` : ''}
						{ideal.heightFt != null && ideal.weightKg != null ? ',' : ''}
						{ideal.weightKg != null ? ` weight ~${ideal.weightKg} kg` : ''}
						{ideal.source === 'age'
							? ` (age ${ideal.ageYears})`
							: ' (for height)'}
					</Body>
				) : null}

				{data.note ? <Subtitle className="mt-2">{data.note}</Subtitle> : null}
				{extraMetrics.length > 0 ? (
					<View className="mt-2 gap-1">
						{extraMetrics.map(item => (
							<Body key={`${item.key}-${item.id}`}>
								{item.key}: {item.value}
								{item.unit ? ` ${item.unit}` : ''}
							</Body>
						))}
					</View>
				) : null}
			</BaseCard>
		</View>
	)
}
