import type { PressableProps, View } from 'react-native'
import { forwardRef } from 'react'
import { cn } from 'tailwind-variants'
import { Pressable } from '@/components/ui/pressable'

export const BaseCard = forwardRef<View, PressableProps>(function BaseCard(
	{ className, ...v }: PressableProps,
	ref,
) {
	return (
		<Pressable
			{...v}
			ref={ref}
			className={cn(
				'bg-white dark:bg-neutral-800 p-4 rounded-lg overflow-hidden',
				className,
			)}
		/>
	)
})
