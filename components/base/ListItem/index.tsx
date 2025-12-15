import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { GestureResponderEvent, TouchableOpacity, View } from 'react-native'
import { cn } from 'tailwind-variants'

export type TBaseListItemProps = {
	className?: string
	text: string
	textClassName?: string
	label?: string
	labelClassName?: string
	icon?: string
	iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	iconClassName?: string
	rightIcon?: string
	rightIconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	rightIconClassName?: string
	showRightIcon?: boolean
	onPress?: (event: GestureResponderEvent) => void
}

export const BaseListItem = (props: TBaseListItemProps) => {
	return (
		<TouchableOpacity
			onPress={props.onPress}
			className={cn('px-5 py-4 flex-row items-center gap-5', props.className)}
			activeOpacity={0.7}
		>
			<View className="h-7 w-7 flex items-center justify-center flex-none">
				{props.icon && (
					<Icon
						name={props.icon}
						className={cn('text-2xl', props.iconClassName)}
					/>
				)}
			</View>
			<View className="flex-1">
				{props.label && (
					<Text className={cn('dark:text-neutral-500', props.labelClassName)}>
						{props.label}
					</Text>
				)}
				<Text className={cn('text-lg', props.textClassName)}>{props.text}</Text>
			</View>
			{(props.rightIcon || props.showRightIcon) && (
				<View className="flex-none">
					<Icon
						name={props.rightIcon || 'chevron-right'}
						className={cn('text-lg', props.rightIconClassName)}
					/>
				</View>
			)}
		</TouchableOpacity>
	)
}
