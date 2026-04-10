import type { TMaybe } from '@/types'
import type { TMedicine } from '@/types/database'

import { useCallback, useMemo } from 'react'
import { Alert } from 'react-native'

import { z } from 'zod'

import { useMMKVArray } from '@/hooks/useMMKVArray'
import { fs } from '@/utils/fs'

import { usePatientMedicinesStorage } from './patient-medicines'

export type TZMedicine = z.infer<typeof zMedicine>
export const zMedicine = z.object({
	id: z.number().nullable(),
	name: z.string().min(1, 'Name is required!'),
	thumbnail: z.any(),
})

export const useMedicinesStorage = () => {
	return useMMKVArray<TMedicine>('medicines', {
		getKey: item => item.id,
	})
}

export type TMedicinesQuery = {
	q?: string
}

export const useMedicines = (query: TMedicinesQuery = {}) => {
	const { data: medicines } = useMedicinesStorage()

	const data = useMemo(() => {
		return medicines
			.filter(item => {
				const q = query.q?.trim().toLowerCase() ?? ''
				return q ? item.name?.toLowerCase().includes(q) : true
			})
			.sort((a, b) => {
				return b.name.localeCompare(a.name)
			})
	}, [query, medicines])

	return { data }
}

export const useMedicine = (id: number) => {
	const { getByKey } = useMedicinesStorage()
	const data = useMemo(() => getByKey(id), [id, getByKey])
	return { data }
}

export const useMedicinesActions = () => {
	const { data: patientMedicines } = usePatientMedicinesStorage()
	const { push, update, getByKey, remove: removeData } = useMedicinesStorage()

	const submit = useCallback(
		async (id: TMaybe<number>, item: TZMedicine) => {
			if (id) {
				const e = getByKey(id)
				if (e?.thumbnail?.uri && e?.thumbnail?.uri !== item.thumbnail?.uri) {
					fs.remove(e.thumbnail.uri)
				}
			}
			if (item.thumbnail?.uri) {
				const { data } = fs.copyAssetTo('files', item.thumbnail)
				if (data) item.thumbnail = data
			}
			if (id) {
				update({
					...item,
					id,
				})
			} else {
				push({
					...item,
					id: Date.now(),
				})
			}
		},
		[push, update, getByKey],
	)

	const remove = useCallback(
		async (id?: number, e?: any) => {
			e?.preventDefault()
			e?.stopPropagation()
			if (!id) return

			if (patientMedicines.some(item => item.medicineId === id)) {
				return Alert.alert(
					'Error',
					'This medicine is assigned to a patient and cannot be removed.',
				)
			}

			Alert.alert('Remove', 'Are you sure you want to remove this medicine?', [
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Remove',
					onPress: () => {
						const data = getByKey(id)
						if (data?.thumbnail?.uri) {
							fs.remove(data.thumbnail.uri)
						}
						removeData(id)
					},
				},
			])
		},
		[getByKey, removeData, patientMedicines],
	)

	const isRemoveable = useCallback(
		(id?: number) => {
			if (!id) return false
			return !patientMedicines.some(v => v.medicineId === id)
		},
		[patientMedicines],
	)

	return { submit, getByKey, remove, isRemoveable }
}
