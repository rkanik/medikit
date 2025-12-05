import { Text } from '@/components/ui/text'
import { cn } from '@/utils/cn'
import { View } from 'react-native'

export const BaseJson = (props: { data: any; className?: string }) => {
	return (
		<View
			className={cn(
				'border dark:bg-neutral-900  dark:border-neutral-700 p-4 rounded-lg',
				props.className,
			)}
		>
			<Text size="sm">{JSON.stringify(props.data, null, 2)}</Text>
		</View>
	)
}
