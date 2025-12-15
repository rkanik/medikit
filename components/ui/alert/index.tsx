import { BaseCard } from '@/components/base/card'
import { PressableProps, View } from 'react-native'
import { cn } from 'tailwind-variants'
import { Button } from '../button'
import { Subtitle, Title } from '../text'

export type TAlertProps = Omit<PressableProps, 'children'> & {
	type?: 'error'
	title?: string
	subtitle?: string
	onClose?: () => void
}

export const Alert = ({
	type,
	title,
	subtitle,
	className,
	onClose,
	...props
}: TAlertProps) => {
	return (
		<BaseCard
			{...props}
			className={cn(
				'flex-row justify-between items-center gap-4',
				{
					'bg-red-500/50 dark:bg-red-500/50': type === 'error',
				},
				className,
			)}
		>
			<View className="flex-1">
				<Title>{title}</Title>
				<Subtitle>{subtitle}</Subtitle>
			</View>
			<View className="flex-none">
				{onClose && (
					<Button
						size="sm"
						icon="x"
						variant="base2"
						onPress={e => {
							e.preventDefault()
							e.stopPropagation()
							onClose?.()
						}}
					/>
				)}
			</View>
		</BaseCard>
	)
}
