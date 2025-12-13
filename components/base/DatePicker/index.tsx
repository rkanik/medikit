import { Icon } from '@/components/ui/icon'
import { TInputProps } from '@/components/ui/input'
import { $df } from '@/utils/dayjs'
import { isAndroid } from '@/utils/is'
import {
	AndroidNativeProps,
	DateTimePickerAndroid,
} from '@react-native-community/datetimepicker'
import type { Ref } from 'react'
import { forwardRef, useCallback } from 'react'
import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'
import { Pressable, Text, TextInput, TouchableOpacity } from 'react-native'
import { cn } from 'tailwind-variants'
import { BaseController, TBaseControllerProps } from '../controller'

type TBaseDatePickerProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<TBaseControllerProps<TFieldValues, TName>, 'render'> &
	TInputProps &
	Omit<AndroidNativeProps, 'value' | 'onChange'> & {
		initialValue?: Date
		inputFormat?: string
		outputFormat?: string
	}

const BaseDatePickerInner = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	{ size = 'lg', ...props }: TBaseDatePickerProps<TFieldValues, TName>,
	ref: Ref<TextInput>,
) => {
	const onPress = useCallback(
		(field: ControllerRenderProps<TFieldValues, TName>) => {
			if (isAndroid) {
				DateTimePickerAndroid.open({
					mode: props.mode,
					value: field.value
						? new Date(field.value)
						: props.initialValue || new Date(),
					display: props.display,
					maximumDate: props.maximumDate,
					onChange(_, date) {
						if (!date) return
						field.onChange($df(date, props.outputFormat ?? 'YYYY-MM-DD'))
					},
				})
			}
		},
		[props],
	)
	return (
		<BaseController
			{...props}
			size={size}
			render={v => (
				<TouchableOpacity
					className={cn(
						'border border-background-300 rounded p-2 h-12 flex-row items-center justify-between',
						{
							'border-red-500': !!v.fieldState.error,
						},
					)}
					onPress={() => onPress(v.field)}
				>
					<Text
						className={cn('text-typography-900 text-lg', {
							'text-typography-500': !v.field.value,
						})}
					>
						{v.field.value
							? $df(v.field.value, props.inputFormat ?? 'YYYY-MM-DD')
							: props.placeholder}
					</Text>
					{v.field.value && (
						<Pressable onPress={() => v.field.onChange(null)}>
							<Icon
								name="x"
								size="lg"
								className="text-background-300 ml-auto"
							/>
						</Pressable>
					)}
				</TouchableOpacity>
			)}
		/>
	)
}

export const BaseDatePicker = forwardRef(BaseDatePickerInner) as <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	props: TBaseDatePickerProps<TFieldValues, TName> & { ref?: Ref<TextInput> },
) => ReturnType<typeof BaseDatePickerInner>
