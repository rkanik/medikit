import type { TTimelineMetric } from '@/const/timelineMetrics'
import type { PressableProps } from 'react-native'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'
import { formatTimelineMetricValue } from '@/const/timelineMetrics'
import { $df } from '@/utils/dayjs'
import { BaseCard } from './base/card'
import { Icon } from './ui/icon'
import { Text } from './ui/text'

type TPatientMetricCardProps = PressableProps & {
	metric: TTimelineMetric
	value?: string | null
	unit?: string | null
	date?: string | null
	changeLabel?: string | null
	className?: string
}

export const PatientMetricCard = ({
	metric,
	value,
	unit,
	date,
	changeLabel,
	className,
	...props
}: TPatientMetricCardProps) => {
	const display = formatTimelineMetricValue(metric.key, value, unit)

	const changeClass = (() => {
		if (!changeLabel) return ''
		if (changeLabel.startsWith('+')) return 'text-green-600 dark:text-green-400'
		if (changeLabel.startsWith('-')) return 'text-red-600 dark:text-red-400'
		return 'text-neutral-500'
	})()

	return (
		<BaseCard
			{...props}
			className={cn(
				'flex-1 min-h-[120px] p-4 relative overflow-hidden',
				className,
			)}
		>
			<View className="flex-row items-center gap-2">
				<Icon name={metric.icon} className="text-lg text-primary" />
				<Text className="text-xs font-semibold uppercase tracking-wide opacity-60">
					{metric.label}
				</Text>
			</View>
			<Text
				className={cn(
					'mt-3 text-2xl font-semibold',
					!display && 'opacity-40 text-xl font-normal',
				)}
				numberOfLines={2}
			>
				{display ?? 'No data'}
			</Text>
			{changeLabel ? (
				<Text className={cn('mt-0.5 text-sm', changeClass)}>
					{changeLabel} from prev
				</Text>
			) : null}
			{date ? (
				<Text className="mt-1 text-xs opacity-50">
					{$df(date, 'DD MMM, YYYY')}
				</Text>
			) : (
				<Text className="mt-1 text-xs opacity-40">Tap to add</Text>
			)}
			<Icon
				name={metric.icon}
				className="absolute -bottom-3 -right-3 text-6xl opacity-5"
			/>
		</BaseCard>
	)
}
