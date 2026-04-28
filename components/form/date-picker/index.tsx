import type { TFormItemProps } from '@/components/form/item'
import type { Ref } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { Text } from '@/components/ui/text'
import { createFormItem } from '../item'

export type TFormDatePickerRef = {
	open: () => void
}

export type TFormDatePickerProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = TFormItemProps<TFieldValues, TName> & {
	ref?: Ref<TFormDatePickerRef>
	mode?: 'date' | 'time'
	hidden?: boolean
	display?: 'default' | 'spinner' | 'calendar' | 'clock'
	placeholder?: string
	initialValue?: Date
	inputFormat?: string
	outputFormat?: string
	minimumDate?: Date
	maximumDate?: Date
	onChange?: (date?: string) => void
}

export type TFormDatePicker = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	props: TFormDatePickerProps<TFieldValues, TName>,
) => React.ReactElement

export const FormDatePicker = createFormItem<
	TFormDatePickerProps,
	TFormDatePicker
>(function FormDatePicker() {
	return <Text>FormDatePicker</Text>
})
