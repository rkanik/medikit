import { Text } from '@/components/ui/text'
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'

export type TBaseControllerProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerProps<TFieldValues, TName> & {
	label?: string
	required?: boolean
	className?: string
}

export const BaseController = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	label,
	required,
	className,
	render,
	...props
}: TBaseControllerProps<TFieldValues, TName>) => {
	return (
		<Controller
			{...props}
			render={v => (
				<View className={className}>
					{label && (
						<Text
							className={cn('text-base font-medium mb-1', {
								'text-red-500': !!v.fieldState.error,
							})}
						>
							{label}
							{required && <Text className="text-red-500">*</Text>}
						</Text>
					)}
					{render(v)}
					{v.fieldState.error && (
						<Text className="text-red-500 text-sm mt-1">
							{v.fieldState.error?.message}
						</Text>
					)}
				</View>
			)}
		/>
	)
}
