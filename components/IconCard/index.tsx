import { BaseCard } from '@/components/base/card'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { PressableProps } from 'react-native'
import { cn } from 'tailwind-variants'

type TIconCardProps = PressableProps & {
	title: string
	className?: string
	iconClassName?: string
	titleClassName?: string
	icon: string
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
			<Icon name={icon} size={iconSize} className={iconClassName} />
			<Text size="lg" className={cn('mt-2', titleClassName)}>
				{title}
			</Text>
			<Icon
				name={icon}
				size="10xl"
				className={cn('absolute -bottom-4 -right-4 opacity-40', iconClassName)}
			/>
		</BaseCard>
	)
}
