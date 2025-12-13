import { Text } from '@/components/ui/text'
import {
	ActivityIndicator,
	Pressable,
	PressableProps,
	TextProps,
} from 'react-native'
import { cn } from 'tailwind-variants'
import { Icon, TIconProps } from '../icon'

export type TButtonProps = PressableProps & {
	size?: string
	variant?: string
}

export const Button = ({ className, ...props }: TButtonProps) => {
	return <Pressable {...props} className={cn('', className)} />
}

export type TButtonTextProps = TextProps & {
	size?: string
}

export const ButtonText = ({ className, ...props }: TButtonTextProps) => {
	return <Text {...props} className={cn('', className)} />
}

export type TButtonIconProps = TIconProps

export const ButtonIcon = ({ className, ...props }: TButtonIconProps) => {
	return <Icon {...props} className={cn('', className)} />
}

export type TButtonSpinnerProps = {
	color?: string
}

export const ButtonSpinner = ({ color }: TButtonSpinnerProps) => {
	return <ActivityIndicator color={color} />
}

Button.Text = ButtonText
Button.Icon = ButtonIcon
Button.Spinner = ButtonSpinner
