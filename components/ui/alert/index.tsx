import { Pressable, PressableProps } from 'react-native'
import { cn } from 'tailwind-variants'

export type TAlertProps = PressableProps & {
	action?: string
}

export const Alert = ({ action, className, ...props }: TAlertProps) => {
	return <Pressable {...props} className={cn('bg-red-500', className)} />
}
