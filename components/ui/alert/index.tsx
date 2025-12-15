import { BaseCard } from '@/components/base/card'
import { PressableProps, View } from 'react-native'
import { cn } from 'tailwind-variants'
import { Button } from '../button'
import { Subtitle, Title } from '../text'

export type TAlertProps = Omit<PressableProps, 'children'> & {
	type?: 'error' | 'success'
	title?: string
	subtitle?: string
	inverted?: boolean
	onClose?: () => void
}

export const Alert = ({
	type,
	title,
	inverted,
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
					'bg-green-500/50 dark:bg-green-500/50':
						type === 'success' && !inverted,
				},
				className,
			)}
		>
			<View className="flex-1">
				<Title
					className={cn({
						'text-green-800 dark:text-green-500':
							type === 'success' && inverted,
					})}
				>
					{title}
				</Title>
				<Subtitle
					className={cn({
						'text-green-800 dark:text-green-500':
							type === 'success' && inverted,
					})}
				>
					{subtitle}
				</Subtitle>
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
