import { Text } from '@/components/ui/text'
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'

export type TBaseControllerProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerProps<TFieldValues, TName> & {
	size?: string
	label?: string
	className?: string
	helperText?: string
	isRequired?: boolean
}

export const BaseController = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	name,
	control,
	className,
	label,
	helperText,
	render,
	...props
}: TBaseControllerProps<TFieldValues, TName>) => {
	return (
		<Controller
			name={name}
			control={control}
			render={v => (
				<View className={cn(className)}>
					{label && <Text>{label}</Text>}
					{render(v)}
					{helperText && <Text>{helperText}</Text>}
					{v.fieldState.error && <Text>{v.fieldState.error?.message}</Text>}
				</View>
			)}
		/>
	)
}
