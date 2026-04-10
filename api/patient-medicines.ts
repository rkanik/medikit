import type { TMaybe } from '@/types'
import type { TPatientMedicine } from '@/types/database'

import { useCallback, useMemo } from 'react'

import { z } from 'zod'

import { useMMKVArray } from '@/hooks/useMMKVArray'
import { $d } from '@/utils/dayjs'
import { fs } from '@/utils/fs'

import { useMedicines, useMedicinesStorage } from './medicines'

export type TZPatientMedicine = z.infer<typeof zPatientMedicine>
export const zPatientMedicine = z.object({
	id: z.number().nullish(),
	patientId: z.number(),
	startDate: z.string().nullish(),
	endDate: z.string().nullish(),
	schedule: z.string().nullish(),
	stock: z.number().nullish(),
	medicine: z.object({
		id: z.number().nullish(),
		name: z.string().min(1, 'Name is required!'),
		thumbnail: z.any().nullish(),
	}),
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
		const today = $d()
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
				const ended = (end: TMaybe<string>) =>
					!!end && !$d(end).isAfter(today, 'day')
				const aEnded = ended(a.endDate)
				const bEnded = ended(b.endDate)
				if (aEnded !== bEnded) return aEnded ? 1 : -1
				return (
					new Date(b.startDate ?? '').getTime() -
					new Date(a.startDate ?? '').getTime()
				)
			})
	}, [medicines, patientMedicines, query])

	return { data }
}

export const usePatientMedicine = (id: number) => {
	const { data: medicines } = useMedicines()
	const { getByKey } = usePatientMedicinesStorage()
	const data = useMemo(() => {
		const item = getByKey(id)
		if (!item) return null
		return {
			...item,
			medicine: medicines.find(v => {
				return v.id === item.medicineId
			}),
		}
	}, [id, medicines, getByKey])
	return { data }
}

export const usePatientMedicineActions = () => {
	const {
		getByKey: getMedicineByKey,
		update: updateMedicine,
		push: pushMedicine,
	} = useMedicinesStorage()
	const { push, update, remove } = usePatientMedicinesStorage()

	const submit = useCallback(
		async (id: TMaybe<number>, item: TZPatientMedicine) => {
			if (item.medicine.id) {
				const e = getMedicineByKey(item.medicine.id)
				if (
					e?.thumbnail?.uri &&
					e?.thumbnail?.uri !== item.medicine.thumbnail?.uri
				) {
					fs.remove(e.thumbnail.uri)
				}
			}
			if (item.medicine.thumbnail?.uri) {
				const { data } = fs.copyAssetTo('files', item.medicine.thumbnail)
				if (data) item.medicine.thumbnail = data
			}

			let medicineId = item.medicine.id
			if (medicineId) {
				updateMedicine({
					...item.medicine,
					id: medicineId,
				})
			} else {
				medicineId = Date.now()
				pushMedicine({
					...item.medicine,
					id: medicineId,
				})
			}

			const data = {
				medicineId,
				endDate: item.endDate,
				startDate: item.startDate,
				schedule: item.schedule,
				stock: item.stock,
			}

			if (id) {
				update({
					id,
					...data,
				})
			} else {
				push({
					id: Date.now(),
					patientId: item.patientId,
					...data,
				})
			}
		},
		[push, update, getMedicineByKey, pushMedicine, updateMedicine],
	)

	return { submit, remove }
}
