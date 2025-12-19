import type { TMaybe } from '@/types'
import type { TPatient } from '@/types/database'

import { useCallback, useMemo } from 'react'

import { useMMKVNumber } from 'react-native-mmkv'
import { z } from 'zod'

import { useMMKVArray } from '@/hooks/useMMKVArray'
import { fs } from '@/utils/fs'

import { useRecordsStorage } from './records'

export type TZPatient = z.infer<typeof zPatient>
export const zPatient = z.object({
	id: z.number().nullable(),
	dob: z.string().nullable(),
	name: z.string().min(1, 'Name is required!'),
	avatar: z.any(),
})

export const usePatientsStorage = () => {
	return useMMKVArray<TPatient>(`patients`, {
		getKey: item => item.id,
	})
}

export const useCurrentPatientIdStorage = () => {
	return useMMKVNumber('currentPatientId')
}

export const useCurrentPatient = () => {
	const { data: items } = usePatientsStorage()
	const [id, setData] = useCurrentPatientIdStorage()
	const data = useMemo<TMaybe<TPatient>>(() => {
		return items.find(item => item.id === id)
	}, [id, items])
	return {
		data,
		setData,
	}
}

export const usePatients = () => {
	const { data } = usePatientsStorage()
	return { data }
}

export const usePatientsActions = () => {
	const { push, update, getByKey } = usePatientsStorage()

	const submit = useCallback(
		async (id: TMaybe<number>, item: TZPatient) => {
			if (id) {
				const e = getByKey(id)
				if (e?.avatar?.uri && e?.avatar?.uri !== item.avatar?.uri) {
					fs.remove(e.avatar.uri)
				}
			}
			if (item.avatar?.uri) {
				const { data } = fs.copyAssetTo('files', item.avatar)
				if (data) item.avatar = data
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

export const usePatient = (id: number) => {
	const { getByKey } = usePatientsStorage()
	const data = useMemo(() => getByKey(id), [id, getByKey])
	return {
		data,
	}
}

export const usePatientActions = (id: number) => {
	const { remove: removeItem, getByKey } = usePatientsStorage()
	const { removeWhere: removeRecordsWhere } = useRecordsStorage()

	const remove = useCallback(async () => {
		const data = getByKey(id)
		if (data?.avatar?.uri) {
			fs.remove(data.avatar.uri)
		}
		removeItem(id)
		removeRecordsWhere(record => record.patientId === id)
	}, [id, getByKey, removeItem, removeRecordsWhere])

	return {
		remove,
	}
}
