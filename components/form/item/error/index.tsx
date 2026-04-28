import type { FieldError } from 'react-hook-form'
import type { Text as RNText, TextProps } from 'react-native'
import { forwardRef } from 'react'
import { cn } from 'tailwind-variants'
import { Text } from '@/components/ui/text'

export type TFormItemErrorProps = TextProps & {
	error?: FieldError
}

export const FormItemError = forwardRef<RNText, TFormItemErrorProps>(
	function FormItemError({ error, className, ...props }, ref) {
		if (!error) return null
		return (
			<Text
				{...props}
				ref={ref}
				className={cn('mt-1 text-sm text-destructive', className)}
			>
				{error?.message}
			</Text>
		)
	},
)
