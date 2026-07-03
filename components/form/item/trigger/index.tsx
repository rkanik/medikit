import type { TBaseButtonProps } from '@/components/base/button'
import { cn } from 'tailwind-variants'
import { BaseButton } from '@/components/base/button'
import { Text } from '@/components/ui/text'

export type TFormItemTriggerProps = TBaseButtonProps & {
	//
}
export function FormItemTrigger({
	title,
	className,
	titleClassName,
	appendIcon = 'chevron-down',
	...props
}: TFormItemTriggerProps) {
	return (
		<BaseButton
			{...props}
			variant="outline"
			title={<Text className={titleClassName}>{title}</Text>}
			className={cn('justify-between', className)}
			appendIcon={appendIcon}
			titleClassName="font-normal"
			appendIconClassName="text-lg text-muted-foreground"
		/>
	)
}
