import { useMMKVArray } from '@/hooks/useMMKVArray'
import { TMaybe } from '@/types'
import { TPatient } from '@/types/database'
import { fs } from '@/utils/fs'
import { useCallback, useMemo } from 'react'
import { useMMKVNumber } from 'react-native-mmkv'
import { z } from 'zod'

export type TZPatient = z.infer<typeof zPatient>
const zPatient = z.object({
	id: z.number().nullable(),
	dob: z.string().nullable(),
	name: z.string().min(1, 'Name is required!'),
	avatar: z.any(),
})

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
		async (id: TMaybe<number>, item: TZPatient) => {
			if (id) {
				const ePatient = getByKey(id)
				if (
					ePatient?.avatar?.uri &&
					ePatient?.avatar?.uri !== item.avatar?.uri
				) {
					fs.remove(ePatient.avatar.uri)
				}
			}
			if (item.avatar?.uri) {
				const { data } = fs.copyAssetTo('avatars', item.avatar)
				if (data) {
					item.avatar = data
				}
			}
			if (id) {
				update({
					...item,
					id,
					updatedAt: new Date().toISOString(),
				})
			} else {
				push({
					...item,
					id: Date.now(),
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})
			}
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
	zPatient,
	usePatients,
	usePatientById,
	useCurrentPatient,
	usePatientsActions,
}
