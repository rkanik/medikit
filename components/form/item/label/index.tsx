import type { Text as RNText, TextProps } from 'react-native'
import { forwardRef } from 'react'
import { cn } from 'tailwind-variants'
import { Text } from '@/components/ui/text'

export type TFormItemLabelProps = TextProps & {
	label?: string
	error?: boolean
	required?: boolean
}

export const FormItemLabel = forwardRef<RNText, TFormItemLabelProps>(
	function FormItemLabel({ label, error, required, className, ...props }, ref) {
		if (!label) return null
		return (
			<Text
				{...props}
				ref={ref}
				className={cn(
					'mb-2 font-medium',
					{
						'text-destructive': error,
					},
					className,
				)}
			>
				{label}
				{required && <Text className="text-destructive">*</Text>}
			</Text>
		)
	},
)
