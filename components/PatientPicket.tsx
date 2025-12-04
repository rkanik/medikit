import { api } from '@/api'
import { TMaybe } from '@/types'
import { TPatient } from '@/types/database'
import { FlashList } from '@shopify/flash-list'
import { useState } from 'react'
import { BaseDialog, TBaseDialogProps } from './base/BaseDialog'
import { PatientCard } from './PatientCard'

export type TPatientPickerProps = TBaseDialogProps & {
	value?: TMaybe<TPatient>
	onChange?: (patient?: TPatient) => void
}

const PatientItems = ({ value, onChange }: TPatientPickerProps) => {
	const { data } = api.patients.usePatients()
	return (
		<FlashList
			data={data}
			contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4 }}
			keyExtractor={item => item.id.toString()}
			renderItem={({ item }) => (
				<PatientCard
					data={item}
					className="mb-4"
					selected={value?.id === item.id}
					onPress={() => onChange?.(item)}
				/>
			)}
		/>
	)
}

export const PatientPicker = ({
	value,
	onChange,
	...props
}: TPatientPickerProps) => {
	const [visible, setVisible] = useState(false)
	return (
		<BaseDialog {...props} visible={visible} setVisible={setVisible}>
			<PatientItems
				value={value}
				onChange={value => {
					onChange?.(value)
					setVisible(false)
				}}
			/>
		</BaseDialog>
	)
}
