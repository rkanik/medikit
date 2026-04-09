import type { TMedicine } from '@/types/database'
import type { GestureResponderEvent } from 'react-native'

import { View } from 'react-native'

import { cn } from 'tailwind-variants'

import { BaseCard } from './base/card'
import { Avatar } from './ui/avatar'
import { Title } from './ui/text'

type TMedicineCardProps = {
	data: TMedicine
	selected?: boolean
	className?: string
	onPress?: (e: GestureResponderEvent) => void
}

export const MedicineCard = ({
	data,
	selected,
	className,
	onPress,
}: TMedicineCardProps) => {
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
					text={data.name}
					image={data.thumbnail?.uri}
				/>
				<View>
					<Title>{data.name}</Title>
				</View>
			</View>
		</BaseCard>
	)
}
