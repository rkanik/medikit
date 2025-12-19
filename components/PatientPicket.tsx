import type { TBaseModalProps } from '@/components/base/modal'
import type { TMaybe } from '@/types'
import type { TPatient } from '@/types/database'

import { useState } from 'react'

import { usePatients } from '@/api/patients'
import { FlashList } from '@/components/FlashList'

import { BaseModal } from './base/modal'
import { PatientCard } from './PatientCard'

export type TPatientPickerProps = TBaseModalProps & {
	value?: TMaybe<TPatient>
	onChange?: (patient?: TPatient) => void
}

const PatientItems = ({ value, onChange }: TPatientPickerProps) => {
	const { data } = usePatients()
	return (
		<FlashList
			data={data}
			contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4 }}
			keyExtractor={item => item.id.toString()}
			ListHeaderComponent={() => (
				<PatientCard
					data={{ id: 0, name: 'All Patients' }}
					className="mb-4"
					selected={!value}
					onPress={() => onChange?.(undefined)}
				/>
			)}
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
		<BaseModal {...props} visible={visible} setVisible={setVisible}>
			<PatientItems
				value={value}
				onChange={value => {
					onChange?.(value)
					setVisible(false)
				}}
			/>
		</BaseModal>
	)
}
