import type { TFormDatePicker, TFormDatePickerProps } from '.'
import { Fragment, useCallback, useImperativeHandle } from 'react'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { $df } from '@/utils/dayjs'
import { createFormItem } from '../item'
import { FormItemTrigger } from '../item/trigger'

export const FormDatePicker = createFormItem<
	TFormDatePickerProps,
	TFormDatePicker
>(function FormDatePicker({
	ref,
	mode,
	field,
	hidden,
	display,
	placeholder,
	minimumDate,
	maximumDate,
	initialValue,
	inputFormat = 'DD-MM-YYYY',
	outputFormat = 'YYYY-MM-DD',
	onChange,
}) {
	const onFocus = useCallback(() => {
		DateTimePickerAndroid.open({
			mode,
			display,
			minimumDate,
			maximumDate,
			value: field.value ? new Date(field.value) : initialValue || new Date(),
			onChange(event, date) {
				if (event.type !== 'set') return
				const value: string | undefined = date ? $df(date, outputFormat) : date
				field.onChange(value)
				onChange?.(value)
			},
		})
	}, [
		mode,
		field,
		display,
		minimumDate,
		maximumDate,
		outputFormat,
		initialValue,
		onChange,
	])
	useImperativeHandle(ref, () => {
		return {
			open: onFocus,
		}
	}, [onFocus])

	if (hidden) return <Fragment />
	return (
		<FormItemTrigger
			appendIcon="calendar"
			title={field.value ? $df(field.value, inputFormat) : placeholder}
			onPress={onFocus}
		/>
	)
})
