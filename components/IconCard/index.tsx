import { cn } from '@/utils/cn'
import { PressableProps } from 'react-native'
import { BaseCard } from '../base/card'
import { Icon } from '../ui/icon'
import { Text } from '../ui/text'

type TIconCardProps = PressableProps & {
	title: string
	className?: string
	iconClassName?: string
	titleClassName?: string
	icon: React.ElementType
	iconSize?: any
}

export const IconCard = ({
	icon,
	title,
	className,
	iconClassName,
	titleClassName,
	iconSize = '2xl',
	...props
}: TIconCardProps) => {
	return (
		<BaseCard {...props} className={cn('p-4', className)}>
			<Icon as={icon} size={iconSize} className={iconClassName} />
			<Text size="lg" className={cn('mt-2', titleClassName)}>
				{title}
			</Text>
			<Icon
				as={icon}
				size="10xl"
				className={cn('absolute -bottom-4 -right-4 opacity-40', iconClassName)}
			/>
		</BaseCard>
	)
}
