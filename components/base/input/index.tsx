import { useCurrentForm } from '@/components/ui/form'
import { Input, TInputProps } from '@/components/ui/input'
import type { Ref } from 'react'
import { forwardRef } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { TextInput } from 'react-native'
import { BaseController, TBaseControllerProps } from '../controller'

type TProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<TBaseControllerProps<TFieldValues, TName>, 'render'> &
	TInputProps & {
		//
	}

const BaseInputInner = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	{
		name,
		label,
		control,
		required,
		className,
		keyboardType,
		onBlur,
		onFocus,
		...props
	}: TProps<TFieldValues, TName>,
	ref: Ref<TextInput>,
) => {
	const form = useCurrentForm()
	return (
		<BaseController
			{...{ name, label, control, required, className }}
			render={v => (
				<Input
					{...props}
					ref={ref}
					error={!!v.fieldState.error}
					value={String(v.field.value)}
					keyboardType={keyboardType}
					onChangeText={text => {
						if (keyboardType === 'numeric') {
							v.field.onChange(Number(text))
						} else {
							v.field.onChange(text)
						}
					}}
					onFocus={e => {
						onFocus?.(e)
						form?.onFocus(e)
					}}
					onBlur={e => {
						onBlur?.(e)
						v.field.onBlur()
					}}
				/>
			)}
		/>
	)
}

export const BaseInput = forwardRef(BaseInputInner) as <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	props: TProps<TFieldValues, TName> & { ref?: Ref<TextInput> },
) => ReturnType<typeof BaseInputInner<TFieldValues, TName>>
