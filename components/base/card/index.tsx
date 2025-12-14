import { Pressable, PressableProps } from 'react-native'
import { cn } from 'tailwind-variants'

export const BaseCard = ({ className, ...props }: PressableProps) => {
	return (
		<Pressable
			{...props}
			className={cn(
				'bg-white dark:bg-neutral-400 p-4 rounded-lg overflow-hidden',
				className,
			)}
			style={{
				boxShadow: '0 0 4px rgba(0, 0, 0, 0.1)',
			}}
			android_ripple={{
				color: 'rgba(0, 0, 0, 0.2)',
				foreground: true,
				borderless: true,
				radius: 100,
			}}
		/>
	)
}
