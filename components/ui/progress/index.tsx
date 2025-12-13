import { View, ViewProps } from 'react-native'
import { cn } from 'tailwind-variants'

export type TProgressProps = ViewProps & {
	size?: string
	value?: number
}

export const Progress = ({ className, ...props }: TProgressProps) => {
	return <View {...props} className={cn('', className)} />
}

export type TProgressFilledTrackProps = ViewProps & {
	//
}

export const ProgressFilledTrack = ({
	className,
	...props
}: TProgressFilledTrackProps) => {
	return <View {...props} className={cn('h-full bg-primary', className)} />
}
