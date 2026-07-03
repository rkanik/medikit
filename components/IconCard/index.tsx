import type { TIconProps } from '@/components/ui/icon'
import type { PressableProps } from 'react-native'
import { cn } from 'tailwind-variants'
import { BaseCard } from '@/components/base/card'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

type TIconCardProps = PressableProps & {
	icon: TIconProps['name']
	iconLibrary?: TIconProps['library']
	title: string
	iconClassName?: string
	titleClassName?: string
}

export const IconCard = ({
	icon,
	iconLibrary,
	title,
	iconClassName,
	titleClassName,
	...props
}: TIconCardProps) => {
	return (
		<BaseCard {...props}>
			<Icon name={icon} library={iconLibrary} className={iconClassName} />
			<Text className={cn('mt-2', titleClassName)}>{title}</Text>
			<Icon
				name={icon}
				library={iconLibrary}
				className={cn(
					'absolute -bottom-4 -right-4 opacity-5',
					iconClassName,
					'text-7xl',
				)}
			/>
		</BaseCard>
	)
}
