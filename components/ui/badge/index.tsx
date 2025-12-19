import type { PressableProps } from 'react-native'

import { Pressable, TouchableOpacity } from 'react-native'

import { cn } from 'tailwind-variants'

import { Text } from '@/components/ui/text'

import { Icon } from '../icon'

export type TBadgeProps = PressableProps & {
	text?: string
	selected?: boolean
	onPressRemove?: () => void
}

export const Badge = ({
	text,
	selected,
	className,
	onPressRemove,
	...props
}: TBadgeProps) => {
	return (
		<Pressable
			{...props}
			className={cn(
				'bg-neutral-100 dark:bg-neutral-900 rounded-md px-2 py-0.5 flex-row items-center gap-1',
				{
					'border border-green-500 dark:border-green-500': selected,
				},
				className,
			)}
		>
			{text && (
				<Text className="text-base text-neutral-600 dark:text-neutral-300">
					{text}
				</Text>
			)}
			{onPressRemove && (
				<TouchableOpacity onPress={onPressRemove}>
					<Icon
						name="x"
						className="text-neutral-500 dark:text-neutral-400 text-base"
					/>
				</TouchableOpacity>
			)}
		</Pressable>
	)
}
