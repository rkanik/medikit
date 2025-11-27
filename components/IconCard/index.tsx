import { cn } from '@/utils/cn'
import { ViewProps } from 'react-native'
import { Card } from '../ui/card'
import { Icon } from '../ui/icon'
import { Text } from '../ui/text'

type TIconCardProps = ViewProps & {
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
	iconSize = 'xl',
	...props
}: TIconCardProps) => {
	return (
		<Card
			{...props}
			className={cn('rounded-lg relative overflow-hidden', className)}
		>
			<Icon as={icon} size={iconSize} className={iconClassName} />
			<Text size="lg" className={cn('mt-2', titleClassName)}>
				{title}
			</Text>
			<Icon
				as={icon}
				size="10xl"
				className={cn('absolute -bottom-4 -right-4 opacity-40', iconClassName)}
			/>
		</Card>
	)
}
