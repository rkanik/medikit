import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { GestureResponderEvent, View } from 'react-native'
import { cn } from 'tailwind-variants'

type TAction = {
	icon: any
	text?: string
	onPress?: (event: GestureResponderEvent) => void
}

type TBaseActionsProps = {
	data: TAction[]
	className?: string
}

export const BaseActions = ({ data, className }: TBaseActionsProps) => {
	return (
		<View
			className={cn(
				'absolute bottom-0 right-0 px-4 flex-row items-center gap-2',
				className,
			)}
		>
			{data.map((item, index) => (
				<Button
					key={index}
					size="xl"
					variant="solid"
					className={cn('rounded-full', {
						'aspect-square p-0': !item.text,
					})}
					onPress={item.onPress}
				>
					<ButtonIcon name={item.icon} />
					{item.text && <ButtonText size="md">{item.text}</ButtonText>}
				</Button>
			))}
		</View>
	)
}
