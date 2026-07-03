import type { TFormItemProps } from '@/components/form/item'
import type { TInputProps } from '@/components/ui/input'
import type { TPrettify } from '@/types'
import type { FieldPath, FieldValues } from 'react-hook-form'
import type { TextInput } from 'react-native'
import { createFormItem } from '@/components/form/item'
import { Input } from '@/components/ui/input'
import { useCurrentForm } from '..'

export type TFormInputRef = TextInput

export type TFormInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = TPrettify<
	TFormItemProps<TFieldValues, TName> &
		Omit<TInputProps, 'value' | 'error' | 'focus'> & {
			ref?: React.Ref<TFormInputRef>
		}
>

export type TFormInput = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	props: TFormInputProps<TFieldValues, TName>,
) => React.ReactElement

export const FormInput = createFormItem<TFormInputProps, TFormInput>(
	function FormInput({
		ref,
		field,
		fieldState,
		keyboardType,
		onBlur,
		onFocus,
		onChangeText,
		...props
	}) {
		const form = useCurrentForm()
		return (
			<Input
				{...props}
				ref={ref}
				error={!!fieldState.error}
				value={field.value ? String(field.value) : ''}
				keyboardType={keyboardType}
				onChangeText={text => {
					onChangeText?.(text)
					if (keyboardType === 'numeric') {
						return field.onChange(Number(text))
					}
					field.onChange(text)
				}}
				onFocus={e => {
					onFocus?.(e)
					form?.onFocus(e)
				}}
				onBlur={e => {
					onBlur?.(e)
					field.onBlur()
				}}
			/>
		)
	},
)
