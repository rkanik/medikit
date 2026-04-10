import type { TMaybe } from '@/types'
import type { TMedicine } from '@/types/database'

import { useCallback, useMemo } from 'react'

import { z } from 'zod'

import { useMMKVArray } from '@/hooks/useMMKVArray'
import { fs } from '@/utils/fs'

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
	}, [medicines, query])

	return { data }
}

export const useMedicine = (id: number) => {
	const { getByKey } = useMedicinesStorage()
	const data = useMemo(() => getByKey(id), [id, getByKey])
	return { data }
}

export const useMedicinesActions = () => {
	const { push, update, getByKey } = useMedicinesStorage()

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

	return { submit, getByKey }
}
