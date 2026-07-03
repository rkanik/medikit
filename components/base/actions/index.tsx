import type { TBaseButtonProps } from '../button'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'
import { BaseButton } from '../button'

export type TAction = TBaseButtonProps & {
	hidden?: boolean
}

export type TBaseActionsProps = {
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
				.filter(v => !v.hidden)
				.map((v, key) => (
					<BaseButton key={key} {...v} />
				))}
		</View>
	)
}
