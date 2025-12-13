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
		autoFocus,
		keyboardType,
		size = 'lg',
		...props
	}: TProps<TFieldValues, TName>,
	ref: Ref<TextInput>,
) => {
	const form = useCurrentForm()
	return (
		<BaseController
			{...props}
			size={size}
			render={v => (
				<Input
					size={size}
					autoFocus={autoFocus}
					value={String(v.field.value)}
					placeholder={props.placeholder || ''}
					keyboardType={keyboardType}
					onChangeText={text => {
						if (keyboardType === 'numeric') {
							v.field.onChange(Number(text))
						} else {
							v.field.onChange(text)
						}
					}}
					onFocus={(e: any) => {
						props.onFocus?.(e)
						form?.onFocus(e)
					}}
					onBlur={(e: any) => {
						props.onBlur?.(e)
						v.field.onBlur()
					}}
				/>
			)}
		/>
	)
}

export const BaseInput = forwardRef(BaseInputInner) as <T extends FieldValues>(
	props: TProps<T> & { ref?: Ref<TextInput> },
) => ReturnType<typeof BaseInputInner>
