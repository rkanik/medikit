import { BaseCard } from '@/components/base/card'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { PressableProps } from 'react-native'
import { cn } from 'tailwind-variants'

type TIconCardProps = PressableProps & {
	icon: string
	title: string
	iconClassName?: string
	titleClassName?: string
}

export const IconCard = ({
	icon,
	title,
	iconClassName,
	titleClassName,
	...props
}: TIconCardProps) => {
	return (
		<BaseCard {...props}>
			<Icon name={icon} className={iconClassName} />
			<Text className={cn('mt-2', titleClassName)}>{title}</Text>
			<Icon
				name={icon}
				className={cn(
					'absolute -bottom-4 -right-4 opacity-5',
					iconClassName,
					'text-7xl',
				)}
			/>
		</BaseCard>
	)
}
