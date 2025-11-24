import { TPatient } from '@/types/database'
import { useCallback } from 'react'
import { useMMKVObject } from 'react-native-mmkv'

const usePatients = () => {
	const [patients = [], setPatients] = useMMKVObject<TPatient[]>('patients')

	const addPatient = useCallback(
		(patient: TPatient) => {
			setPatients((patients = []) => {
				return [...patients, patient]
			})
		},
		[setPatients],
	)

	return {
		patients,
		addPatient,
	}
}

export const patients = {
	usePatients,
}
