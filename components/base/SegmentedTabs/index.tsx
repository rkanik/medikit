import { View } from 'react-native'
import { cn } from 'tailwind-variants'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'

export type TSegmentedTabItem<T extends string = string> = {
	key: T
	title: string
}

export type TSegmentedTabsProps<T extends string = string> = {
	value: T
	items: TSegmentedTabItem<T>[]
	onChange: (key: T) => void
	className?: string
}

export const SegmentedTabs = <T extends string = string>({
	value,
	items,
	onChange,
	className,
}: TSegmentedTabsProps<T>) => {
	return (
		<View
			className={cn(
				'flex-row overflow-hidden rounded-full bg-secondary p-1 gap-1',
				className,
			)}
		>
			{items.map(item => {
				const active = item.key === value
				return (
					<Pressable
						key={item.key}
						onPress={() => onChange(item.key)}
						style={{ borderRadius: 9999, overflow: 'hidden' }}
						className={cn(
							'flex-1 items-center justify-center overflow-hidden rounded-full py-2 px-3',
							{
								'bg-primary': active,
							},
						)}
					>
						<Text
							className={cn('text-base font-medium', {
								'text-primary-foreground': active,
							})}
						>
							{item.title}
						</Text>
					</Pressable>
				)
			})}
		</View>
	)
}
