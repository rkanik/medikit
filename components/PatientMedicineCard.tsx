import type { TPatientMedicine } from '@/types/database'
import type { GestureResponderEvent } from 'react-native'

import { useMemo } from 'react'
import { View } from 'react-native'

import { cn } from 'tailwind-variants'

import { $d, $df, $dfr } from '@/utils/dayjs'
import { paths } from '@/utils/paths'

import { BaseCard } from './base/card'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import { Subtitle, Title } from './ui/text'

type TPatientMedicineCardProps = {
	data: TPatientMedicine
	selected?: boolean
	className?: string
	onPress?: (e: GestureResponderEvent) => void
}

export const PatientMedicineCard = ({
	data,
	selected,
	className,
	onPress,
}: TPatientMedicineCardProps) => {
	const status = useMemo(() => {
		const today = $d()
		if (data.endDate && !$d(data.endDate).isAfter(today, 'day')) {
			return {
				text: 'Completed',
				className: 'bg-green-500 dark:bg-green-900',
			}
		}
		if (data.startDate && $d(data.startDate).isAfter(today)) {
			return {
				text: 'Pending',
				className: 'bg-yellow-500 dark:bg-yellow-400',
			}
		}
		return {
			text: 'Running',
			className: 'bg-blue-500 dark:bg-blue-900',
		}
	}, [data.endDate, data.startDate])

	const date = useMemo(() => {
		if (!data.startDate) return null
		const thisYear = $d().year()
		const y = (d: string | Date) => ($d(d).year() === thisYear ? 'YY' : 'YYYY')

		if (data.endDate) {
			return `${$dfr(data.startDate, data.endDate)} (${$d(data.endDate).diff(data.startDate, 'days')} days)`
		}
		return `${$df(data.startDate, `DD MMMM, ${y(data.startDate)}`)} (${$d().diff(data.startDate, 'days')} days)`
	}, [data.endDate, data.startDate])

	return (
		<BaseCard
			onPress={onPress}
			className={cn('px-5 py-2', className, {
				'border-2 border-green-500 dark:border-green-300': selected,
			})}
		>
			<View
				className={cn('items-center gap-4 flex-row', {
					'opacity-50': status.text === 'Completed',
				})}
			>
				<Avatar
					variant="secondary"
					className="w-16 h-16"
					text={data.medicine?.name}
					image={paths.document(data.medicine?.thumbnail?.uri)}
				/>
				<View>
					<Title>{data.medicine?.name}</Title>
					{date && <Subtitle>{date}</Subtitle>}
					<View className="mt-1 flex-row items-center gap-2">
						<Badge
							text={status.text}
							className={status.className}
							textClassName="text-sm"
						/>
						{data.schedule && (
							<Badge
								text={data.schedule}
								className="bg-gray-500 dark:bg-gray-600"
								textClassName="text-sm"
							/>
						)}
						{typeof data.stock === 'number' ? (
							<Badge
								text={`${data.stock} left`}
								className={cn({
									'bg-red-500 dark:bg-red-900': data.stock <= 5,
									'bg-yellow-500 dark:bg-yellow-900':
										data.stock > 5 && data.stock <= 10,
									'bg-green-500 dark:bg-green-900': data.stock > 10,
								})}
								textClassName="text-sm"
							/>
						) : null}
					</View>
				</View>
			</View>
		</BaseCard>
	)
}
