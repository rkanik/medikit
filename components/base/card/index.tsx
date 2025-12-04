import { cn } from '@/utils/cn'
import { Pressable, PressableProps } from 'react-native'

export const BaseCard = ({ className, ...props }: PressableProps) => {
	return (
		<Pressable
			{...props}
			className={cn(
				'bg-white dark:bg-neutral-800 rounded-lg overflow-hidden border border-green-200 dark:border-neutral-700',
				className,
			)}
		/>
	)
}
