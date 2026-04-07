import type { TMaybe } from '@/types'
import type { TMedicine } from '@/types/database'

import { useCallback } from 'react'

import { useMMKVArray } from '@/hooks/useMMKVArray'

export const useMedicinesStorage = () => {
	return useMMKVArray<TMedicine>('medicines', {
		getKey: item => item.id,
	})
}

export const useMedicines = () => {
	const { data } = useMedicinesStorage()
	return { data }
}

export const useMedicinesActions = () => {
	const { push, update, getByKey } = useMedicinesStorage()

	const submit = useCallback(
		async (id: TMaybe<number>, item: TMedicine) => {
			if (id) {
				const e = getByKey(id)
			}
		},
		[getByKey],
	)

	return { submit }
}
