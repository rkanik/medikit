import { useMMKVArray } from '@/hooks/useMMKVArray'
import { TMaybe } from '@/types'
import { TPatient } from '@/types/database'
import { fs } from '@/utils/fs'
import { useCallback, useMemo } from 'react'

const usePatientsStorage = () => {
	return useMMKVArray<TPatient>(`patients`, {
		getKey: item => item.id,
	})
}

const usePatients = () => {
	const { data } = usePatientsStorage()
	return { data }
}

const usePatientsActions = () => {
	const { push, update, getByKey } = usePatientsStorage()

	const submit = useCallback(
		async (id: TMaybe<number>, item: Omit<TPatient, 'id'>) => {
			if (item.avatar) {
				if (id) {
					const existingPatient = getByKey(id)
					if (
						existingPatient?.avatar?.uri &&
						existingPatient?.avatar?.uri !== item.avatar?.uri
					) {
						fs.remove(existingPatient?.avatar?.uri)
					}
				}
				const { data } = fs.copyAssetTo('avatars', item.avatar)
				if (data) item.avatar = data
			}
			if (id) {
				return update({
					id,
					...item,
				})
			}
			push({
				...item,
				id: Date.now(),
			})
		},
		[push, update, getByKey],
	)

	return {
		submit,
	}
}

const usePatientById = (id: number) => {
	const { getByKey } = usePatientsStorage()
	const data = useMemo(() => getByKey(id), [id, getByKey])
	return { data }
}

export const patients = {
	usePatients,
	usePatientById,
	usePatientsActions,
}
