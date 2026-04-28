import { View } from 'react-native'
import { cn } from 'tailwind-variants'
import { Text } from '@/components/ui/text'
import { useIsOnline } from '@/hooks/useIsOnline'

export type TOfflineProps = {
	className?: string
}
export const Offline = ({ className }: TOfflineProps) => {
	const { isOnline } = useIsOnline()
	if (isOnline === false) {
		return (
			<View className={cn('bg-secondary py-1', className)}>
				<Text className="text-center text-secondary-foreground">
					Waiting for network...
				</Text>
			</View>
		)
	}
	return
}
