import { Text } from '@/components/ui/text'
import { Pressable, TextProps, ViewProps } from 'react-native'
import { cn } from 'tailwind-variants'

export type TBadgeProps = ViewProps & {
	size?: string
	action?: string
}

export const Badge = ({ className, ...props }: TBadgeProps) => {
	return <Pressable {...props} className={cn('', className)} />
}

export type TBadgeTextProps = TextProps & {
	//
}

export const BadgeText = ({ className, ...props }: TBadgeTextProps) => {
	return <Text {...props} className={cn('', className)} />
}

Badge.Text = BadgeText
