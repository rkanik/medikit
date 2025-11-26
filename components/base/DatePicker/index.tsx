import { CloseIcon, Icon } from '@/components/ui/icon'
import { InputField } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import { $df } from '@/utils/dayjs'
import { isAndroid } from '@/utils/is'
import {
	AndroidNativeProps,
	DateTimePickerAndroid,
} from '@react-native-community/datetimepicker'
import type { Ref } from 'react'
import { forwardRef, useCallback } from 'react'
import type { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'
import { Pressable, Text, TextInput, TouchableOpacity } from 'react-native'
import { BaseController, TBaseControllerProps } from '../controller'

type TProps<T extends FieldValues> = TBaseControllerProps<T> &
	React.ComponentProps<typeof InputField> &
	Omit<AndroidNativeProps, 'value' | 'onChange'> & {
		initialValue?: Date
	}

const BaseDatePickerInner = <T extends FieldValues>(
	{ size = 'lg', ...props }: TProps<T>,
	ref: Ref<TextInput>,
) => {
	const onPress = useCallback(
		(field: ControllerRenderProps<T, Path<T>>) => {
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
						field.onChange(date.toISOString().split('T')[0])
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
							? $df(v.field.value, 'DD MMMM, YYYY')
							: props.placeholder}
					</Text>
					{v.field.value && (
						<Pressable onPress={() => v.field.onChange(null)}>
							<Icon
								as={CloseIcon}
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
	T extends FieldValues,
>(
	props: TProps<T> & { ref?: Ref<TextInput> },
) => ReturnType<typeof BaseDatePickerInner>
