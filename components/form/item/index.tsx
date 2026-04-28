import type {
	Control,
	FieldPath,
	FieldValues,
	UseControllerReturn,
} from 'react-hook-form'
import type { ViewProps } from 'react-native'
import { memo } from 'react'
import { View } from 'react-native'
import { useController } from 'react-hook-form'
import { FormItemError } from './error'
import { FormItemLabel } from './label'

export type TFormItemProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName
	control: Control<TFieldValues>
	label?: string
	wrapper?: ViewProps
	required?: boolean
}

export const createFormItem = <TProps extends TFormItemProps, TFormItem>(
	Component: (
		props: Omit<TProps, keyof TFormItemProps> & UseControllerReturn,
	) => React.ReactElement,
) => {
	const displayName = `FormItem(${(Component as any).displayName || Component.name})`
	console.log('🚀 ~ createFormItem ~ displayName:', displayName)
	const Memoed = memo(Component)
	const FormItem = ({
		name,
		label,
		control,
		wrapper,
		required,
		...rest
	}: TProps) => {
		const { field, fieldState, formState } = useController({ name, control })
		return (
			<View {...wrapper}>
				<FormItemLabel
					label={label}
					error={!!fieldState.error}
					required={required}
				/>
				<Memoed
					field={field}
					formState={formState}
					fieldState={fieldState}
					{...rest}
				/>
				<FormItemError error={fieldState.error} />
			</View>
		)
	}
	FormItem.displayName = `FormItem(${(Component as any).displayName || Component.name})`
	return memo(FormItem) as TFormItem
}
