import { useMMKVArray } from '@/hooks/useMMKVArray'
import { TMaybe } from '@/types'
import { TRecord } from '@/types/database'
import { useCallback, useMemo } from 'react'
import { Alert } from 'react-native'
import { patients } from './patients'

const useRecordsStorage = () => {
	return useMMKVArray<TRecord>(`records`, {
		getKey: item => item.id,
	})
}

const useRecords = () => {
	const { data: records } = useRecordsStorage()
	const { data: patient } = patients.useCurrentPatient()

	const data = useMemo(() => {
		return records.filter(record => {
			return record.patientId === patient?.id
		})
	}, [records, patient])

	return { data }
}

const useRecordsActions = () => {
	const { push, update } = useRecordsStorage()
	const { data: patient } = patients.useCurrentPatient()

	const submit = useCallback(
		async (id: TMaybe<number>, item: Omit<TRecord, 'id' | 'patientId'>) => {
			if (!patient) {
				Alert.alert('Error', 'Please select a patient first')
				return
			}
			if (id) {
				return update({
					id,
					...item,
					patientId: patient.id,
					updatedAt: new Date().toISOString(),
				})
			}
			push({
				...item,
				id: Date.now(),
				patientId: patient.id,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
		},
		[patient, push, update],
	)

	return { submit }
}

export const records = { useRecords, useRecordsActions }
