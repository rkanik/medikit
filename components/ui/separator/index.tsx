'use client'

import type { ViewProps } from 'react-native'

import * as React from 'react'
import { View } from 'react-native'

import { cn } from 'tailwind-variants'

export type TSeparatorProps = ViewProps & {
	decorative?: boolean
	orientation?: 'horizontal' | 'vertical'
}

const Separator = React.forwardRef<View, TSeparatorProps>(
	(
		{ className, orientation = 'horizontal', decorative = true, ...props },
		ref,
	) => (
		<View
			ref={ref}
			// decorative={decorative}
			// orientation={orientation}
			className={cn(
				'shrink-0 bg-border',
				orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
				className,
			)}
			{...props}
		/>
	),
)
Separator.displayName = 'Separator'

export { Separator }
