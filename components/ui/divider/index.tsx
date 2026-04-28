import type { ViewProps } from 'react-native'

import { View } from 'react-native'

import { cn } from 'tailwind-variants'

export type TDividerProps = ViewProps & {
	//
}

/** @deprecated Use Separator instead */
export const Divider = ({ className, ...props }: TDividerProps) => {
	return (
		<View
			{...props}
			className={cn('h-px bg-neutral-200 dark:bg-neutral-700', className)}
		/>
	)
}
