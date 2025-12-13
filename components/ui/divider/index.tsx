import { View, ViewProps } from 'react-native'
import { cn } from 'tailwind-variants'

export type TDividerProps = ViewProps & {
	//
}

export const Divider = ({ className, ...props }: TDividerProps) => {
	return (
		<View
			{...props}
			className={cn('h-px bg-gray-200 dark:bg-gray-700', className)}
		/>
	)
}
