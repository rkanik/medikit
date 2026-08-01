import type { TBaseModalProps } from '@/components/base/modal'
import type { TMaybe } from '@/types'
import type { TPatient } from '@/types/database'
import { useState } from 'react'
import { FlashList } from '@/components/FlashList'
import { usePatientsListQuery } from '@/queries/usePatientsListQuery'
import { BaseModal } from './base/modal'
import { PatientCard } from './PatientCard'

export type TPatientPickerProps = TBaseModalProps & {
	value?: TMaybe<TPatient>
	onChange?: (patient?: TPatient) => void
	/** Only list patients that have at least one record. */
	withRecords?: boolean
}

const PatientItems = ({ value, onChange, withRecords }: TPatientPickerProps) => {
	const { data } = usePatientsListQuery({
		includePrivate: true,
		withRecords,
	})
	return (
		<FlashList
			data={data}
			contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4 }}
			keyExtractor={item => item.id.toString()}
			ListHeaderComponent={() => (
				<PatientCard
					data={{ id: 0, name: 'All Patients' } as TPatient}
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
	withRecords,
	...props
}: TPatientPickerProps) => {
	const [visible, setVisible] = useState(false)
	return (
		<BaseModal {...props} visible={visible} setVisible={setVisible}>
			<PatientItems
				value={value}
				withRecords={withRecords}
				onChange={value => {
					onChange?.(value)
					setVisible(false)
				}}
			/>
		</BaseModal>
	)
}
