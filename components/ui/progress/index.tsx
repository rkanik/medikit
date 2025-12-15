import { View, ViewProps } from 'react-native'
import { cn } from 'tailwind-variants'

export type TProgressProps = ViewProps & {
	value?: number
}

export const Progress = ({
	className,
	value = 0,
	...props
}: TProgressProps) => {
	return (
		<View
			{...props}
			className={cn(
				'h-2 rounded-full flex-1 bg-neutral-200 dark:bg-neutral-700',
				className,
			)}
		>
			<View
				style={{ width: `${value}%` }}
				className="h-2 rounded-full bg-green-400 dark:bg-green-500"
			/>
		</View>
	)
}
