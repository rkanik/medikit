import type { TMaybe } from '@/types'
import type { TPatientMedicine } from '@/types/database'

import { useCallback, useMemo } from 'react'

import { z } from 'zod'

import { useMMKVArray } from '@/hooks/useMMKVArray'

import { useMedicines } from './medicines'

export type TZPatientMedicine = z.infer<typeof zPatientMedicine>
export const zPatientMedicine = z.object({
	id: z.number().nullable(),
	patientId: z.number(),
	medicineId: z.number(),
	startDate: z.string().nullable(),
	endDate: z.string().nullable(),
})

export const usePatientMedicinesStorage = () => {
	return useMMKVArray<TPatientMedicine>('patient-medicines', {
		getKey: item => item.id,
	})
}

export type TPatientMedicinesQuery = {
	q?: string
	patientId?: number
}

export const usePatientMedicines = (query: TPatientMedicinesQuery = {}) => {
	const { data: medicines } = useMedicines()
	const { data: patientMedicines } = usePatientMedicinesStorage()
	const data = useMemo(() => {
		return patientMedicines
			.filter(item => {
				const q = query.q?.trim().toLowerCase() ?? ''
				return (
					(query.patientId ? item.patientId === query.patientId : true) &&
					(q ? item.medicineId?.toString().includes(q) : true)
				)
			})
			.map(item => {
				return {
					...item,
					medicine: medicines.find(v => {
						return v.id === item.medicineId
					}),
				}
			})
			.sort((a, b) => {
				return (
					new Date(b.startDate ?? '').getTime() -
					new Date(a.startDate ?? '').getTime()
				)
			})
	}, [medicines, patientMedicines, query])

	return { data }
}

export const usePatientMedicine = (id: number) => {
	const { getByKey } = usePatientMedicinesStorage()
	const data = useMemo(() => getByKey(id), [id, getByKey])
	return { data }
}

export const usePatientMedicineActions = () => {
	const { push, update } = usePatientMedicinesStorage()

	const submit = useCallback(
		async (id: TMaybe<number>, item: TZPatientMedicine) => {
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
		[push, update],
	)

	return { submit }
}
