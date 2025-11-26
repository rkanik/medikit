import { useCurrentForm } from '@/components/ui/form'
import { Input, InputField } from '@/components/ui/input'
import type { Ref } from 'react'
import { forwardRef } from 'react'
import type { FieldValues } from 'react-hook-form'
import { TextInput } from 'react-native'
import { BaseController, TBaseControllerProps } from '../controller'

type TProps<T extends FieldValues> = TBaseControllerProps<T> &
	React.ComponentProps<typeof InputField> & {
		//
	}

const BaseInputInner = <T extends FieldValues>(
	{ keyboardType, size = 'lg', ...props }: TProps<T>,
	ref: Ref<TextInput>,
) => {
	const form = useCurrentForm()
	return (
		<BaseController
			{...props}
			size={size}
			render={v => (
				<Input size={size}>
					<InputField
						size={size}
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
				</Input>
			)}
		/>
	)
}

export const BaseInput = forwardRef(BaseInputInner) as <T extends FieldValues>(
	props: TProps<T> & { ref?: Ref<TextInput> },
) => ReturnType<typeof BaseInputInner>
