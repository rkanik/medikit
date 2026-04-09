import type { TPatientMedicine } from '@/types/database'
import type { GestureResponderEvent } from 'react-native'

import { View } from 'react-native'

import { cn } from 'tailwind-variants'

import { $d, $df } from '@/utils/dayjs'

import { BaseCard } from './base/card'
import { Avatar } from './ui/avatar'
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
	return (
		<BaseCard
			onPress={onPress}
			className={cn('px-5 py-2', className, {
				'border-2 border-green-500 dark:border-green-300': selected,
			})}
		>
			<View className="items-center gap-4 flex-row">
				<Avatar
					variant="secondary"
					className="w-16 h-16"
					text={data.medicine?.name}
					image={data.medicine?.thumbnail?.uri}
				/>
				<View>
					<Title>{data.medicine?.name}</Title>
					{data.startDate && (
						<Subtitle>{$df(data.startDate, 'DD MMMM, YYYY')}</Subtitle>
					)}
					{data.endDate ? (
						<Subtitle>{` - ${$df(data.endDate, 'DD MMMM, YYYY')} (${$d().diff(data.endDate, 'days')} days)`}</Subtitle>
					) : (
						<Subtitle>Running</Subtitle>
					)}
				</View>
			</View>
		</BaseCard>
	)
}
