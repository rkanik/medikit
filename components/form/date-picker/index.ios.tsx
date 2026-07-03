import type { TFormDatePicker, TFormDatePickerProps } from '.'
import { Fragment, useCallback, useImperativeHandle, useState } from 'react'
import { View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { BaseButton } from '@/components/base/button'
import { BaseDialog } from '@/components/base/dialog'
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
	const [value, setValue] = useState<Date>()
	const [visible, setVisible] = useState(false)

	const onFocus = useCallback(() => {
		setValue(field.value)
		setVisible(true)
	}, [field.value])

	useImperativeHandle(ref, () => {
		return {
			open: onFocus,
		}
	}, [onFocus])

	return (
		<Fragment>
			{!hidden && (
				<FormItemTrigger
					appendIcon="calendar"
					onPress={onFocus}
					title={field.value ? $df(field.value, inputFormat) : placeholder}
				/>
			)}
			<BaseDialog height={350} open={visible} onOpenChange={setVisible}>
				<DateTimePicker
					mode={mode}
					display={display}
					minimumDate={minimumDate}
					maximumDate={maximumDate}
					value={value ? new Date(value) : initialValue || new Date()}
					onChange={(_, date) => setValue(date)}
				/>
				<View className="mt-4 flex-row justify-end gap-2">
					<BaseButton
						variant="outline"
						title="Cancel"
						onPress={() => setVisible(false)}
					/>
					<BaseButton
						title="Okay"
						onPress={() => {
							const v: string | undefined = value
								? $df(value, outputFormat)
								: value
							field.onChange(v)
							onChange?.(v)
							setVisible(false)
						}}
					/>
				</View>
			</BaseDialog>
		</Fragment>
	)
})
