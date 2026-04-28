import type { TFormDatePicker, TFormDatePickerProps } from '.'
import { useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { View } from 'react-native'
import { BaseButton } from '@/components/base/button'
import { BaseDialog } from '@/components/base/dialog'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { $df } from '@/utils/dayjs'
import { createFormItem } from '../item'
import { FormItemTrigger } from '../item/trigger'

export const FormDatePicker = createFormItem<
	TFormDatePickerProps,
	TFormDatePicker
>(function FormDatePicker({
	ref,
	field,
	hidden,
	placeholder,
	minimumDate,
	maximumDate,
	inputFormat = 'DD-MM-YYYY',
	outputFormat = 'YYYY-MM-DD',
	onChange,
}) {
	//
	const [value, setValue] = useState<Date | undefined>(field.value)
	const [visible, setVisible] = useState(false)

	useImperativeHandle(
		ref,
		() => ({
			open() {
				if (hidden) {
					setValue(field.value)
					setVisible(true)
					return
				}
			},
		}),
		[hidden, field.value],
	)

	const onSaveDate = useCallback(
		(value: Date | undefined) => {
			console.log('onSaveDate', value)
			const v: string | undefined = value ? $df(value, outputFormat) : value
			field.onChange(v)
			onChange?.(v)
			setOpen(false)
			setVisible(false)
		},
		[field, outputFormat, onChange],
	)

	const disabled = useMemo(
		() =>
			[
				minimumDate ? { before: minimumDate } : undefined,
				maximumDate ? { after: maximumDate } : undefined,
			].filter(v => !!v),
		[minimumDate, maximumDate],
	)

	const [open, setOpen] = useState(false)

	if (hidden)
		return (
			<BaseDialog open={visible} onOpenChange={setVisible}>
				<Calendar
					selected={value}
					disabled={disabled}
					onSelect={v => setValue(v)}
				/>
				<View className="flex-row justify-end gap-2">
					<BaseButton
						size="xs"
						title="Close"
						variant="outline"
						onPress={() => setVisible(false)}
					/>
					<BaseButton
						size="xs"
						title="Select"
						onPress={() => onSaveDate(value)}
					/>
				</View>
			</BaseDialog>
		)

	return (
		<Popover modal open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<FormItemTrigger
					appendIcon="calendar"
					onPress={() => setOpen(true)}
					title={field.value ? $df(field.value, inputFormat) : placeholder}
				/>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-auto overflow-hidden p-2">
				<Calendar
					selected={field.value}
					disabled={disabled}
					onSelect={onSaveDate}
				/>
			</PopoverContent>
		</Popover>
	)
})
