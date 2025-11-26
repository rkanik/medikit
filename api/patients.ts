import { useMMKVArray } from '@/hooks/useMMKVArray'
import { TMaybe } from '@/types'
import { TPatient } from '@/types/database'
import { fs } from '@/utils/fs'
import { useCallback, useMemo } from 'react'
import { useMMKVNumber } from 'react-native-mmkv'

const usePatientsStorage = () => {
	return useMMKVArray<TPatient>(`patients`, {
		getKey: item => item.id,
	})
}

const useCurrentPatientIdStorage = () => {
	return useMMKVNumber('currentPatientId')
}

const useCurrentPatient = () => {
	const { data: items } = usePatientsStorage()
	const [currentPatientId, setData] = useCurrentPatientIdStorage()
	const data = useMemo<TMaybe<TPatient>>(() => {
		return (
			items.find(item => {
				return item.id === currentPatientId
			}) || items[0]
		)
	}, [items, currentPatientId])
	return {
		data,
		setData,
	}
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
					updatedAt: new Date().toISOString(),
				})
			}
			push({
				...item,
				id: Date.now(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
		},
		[push, update, getByKey],
	)

	return {
		submit,
	}
}

const usePatientById = (id: number) => {
	const { remove: removeItem, getByKey } = usePatientsStorage()
	const data = useMemo(() => getByKey(id), [id, getByKey])

	const remove = useCallback(async () => {
		if (data?.avatar?.uri) {
			fs.remove(data.avatar.uri)
		}
		removeItem(data?.id)
	}, [data, removeItem])

	return { data, remove }
}

export const patients = {
	usePatients,
	usePatientById,
	useCurrentPatient,
	usePatientsActions,
}
