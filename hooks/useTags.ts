import { useMemo } from 'react'

import { useRecordsStorage } from '@/api/records'

export const useTags = () => {
	const { data: records } = useRecordsStorage()

	const data = useMemo(() => {
		return [...new Set(records.map(record => record.tags || []).flat())]
	}, [records])

	return {
		data,
	}
}
