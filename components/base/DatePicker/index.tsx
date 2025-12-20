import type { TBaseControllerProps } from '@/components/base/controller'
import type { AndroidNativeProps } from '@react-native-community/datetimepicker'
import type { Ref } from 'react'
import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'
import type { TextInput } from 'react-native'
import type { VariantProps } from 'tailwind-variants'

import { forwardRef, useCallback } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { cn } from 'tailwind-variants'

import { Icon } from '@/components/ui/icon'
import { inputVariants } from '@/components/ui/input'
import { Pressable } from '@/components/ui/pressable'
import { $df } from '@/utils/dayjs'
import { isAndroid } from '@/utils/is'

import { BaseController } from '../controller'

type TBaseDatePickerProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<TBaseControllerProps<TFieldValues, TName>, 'render'> &
	VariantProps<typeof inputVariants> &
	Omit<AndroidNativeProps, 'value' | 'onChange'> & {
		placeholder?: string
		initialValue?: Date
		inputFormat?: string
		outputFormat?: string
	}

const BaseDatePickerInner = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	{
		name,
		size,
		mode,
		label,
		variant,
		control,
		display,
		required,
		className,
		placeholder,
		initialValue,
		maximumDate = new Date(),
		inputFormat = 'DD-MM-YYYY',
		outputFormat = 'YYYY-MM-DD',
	}: TBaseDatePickerProps<TFieldValues, TName>,
	ref: Ref<TextInput>,
) => {
	const onPress = useCallback(
		(field: ControllerRenderProps<TFieldValues, TName>) => {
			if (isAndroid) {
				DateTimePickerAndroid.open({
					mode,
					display,
					maximumDate,
					value: field.value
						? new Date(field.value)
						: initialValue || new Date(),
					onChange(event, date) {
						if (event.type !== 'set') return
						field.onChange(date ? $df(date, outputFormat) : date)
					},
				})
			}
		},
		[mode, initialValue, display, maximumDate, outputFormat],
	)
	return (
		<BaseController
			{...{ name, label, control, required, className }}
			render={v => (
				<Pressable
					className={inputVariants({
						size,
						variant,
						focus: false,
						error: !!v.fieldState.error,
					})}
					onPress={() => {
						onPress(v.field)
					}}
				>
					<Text
						className={cn('text-lg text-black dark:text-white', {
							'text-neutral-500 dark:text-neutral-400': !v.field.value,
						})}
					>
						{v.field.value ? $df(v.field.value, inputFormat) : placeholder}
					</Text>
					<View className="flex-none flex-row items-center gap-2">
						{v.field.value ? (
							<TouchableOpacity onPress={() => v.field.onChange(null)}>
								<Icon
									name="x"
									className="text-lg text-neutral-500 dark:text-neutral-400"
								/>
							</TouchableOpacity>
						) : (
							<Icon
								name="calendar"
								className="text-xl text-neutral-500 dark:text-neutral-400"
							/>
						)}
					</View>
				</Pressable>
			)}
		/>
	)
}

export const BaseDatePicker = forwardRef(BaseDatePickerInner) as <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	props: TBaseDatePickerProps<TFieldValues, TName> & { ref?: Ref<TextInput> },
) => ReturnType<typeof BaseDatePickerInner<TFieldValues, TName>>
