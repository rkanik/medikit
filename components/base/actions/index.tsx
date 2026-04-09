import type { GestureResponderEvent } from 'react-native'

import { View } from 'react-native'

import { cn } from 'tailwind-variants'

import { Button } from '@/components/ui/button'

type TAction = {
	icon: any
	text?: string
	hidden?: boolean
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
			{data
				.filter(item => !item.hidden)
				.map((item, index) => (
					<Button
						key={index}
						icon={item.icon}
						text={item.text}
						className="rounded-full"
						onPress={item.onPress}
					/>
				))}
		</View>
	)
}
