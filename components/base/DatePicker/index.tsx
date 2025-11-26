import { CloseIcon, Icon } from '@/components/ui/icon'
import { InputField } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import { $df } from '@/utils/dayjs'
import { isAndroid } from '@/utils/is'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import type { Ref } from 'react'
import { forwardRef, useCallback } from 'react'
import type { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'
import { Pressable, Text, TextInput, TouchableOpacity } from 'react-native'
import { BaseController, TBaseControllerProps } from '../controller'

type TProps<T extends FieldValues> = TBaseControllerProps<T> &
	React.ComponentProps<typeof InputField> & {
		//
	}

const BaseDatePickerInner = <T extends FieldValues>(
	{ size = 'lg', ...props }: TProps<T>,
	ref: Ref<TextInput>,
) => {
	const onPress = useCallback((field: ControllerRenderProps<T, Path<T>>) => {
		if (isAndroid) {
			DateTimePickerAndroid.open({
				mode: 'date',
				value: field.value ? new Date(field.value) : new Date('2000-01-01'),
				display: 'spinner',
				maximumDate: new Date(),
				onChange(event, date) {
					if (date) {
						field.onChange(date.toISOString().split('T')[0])
					}
				},
			})
		}
	}, [])
	return (
		<BaseController
			{...props}
			size={size}
			render={v => (
				<TouchableOpacity
					className="border border-background-300 rounded p-2 h-12 flex-row items-center justify-between"
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
