import { recordTypes, useRecords } from '@/api/records'
import { $d } from '@/utils/dayjs'
import { useMemo } from 'react'

export const useRecordsSummary = ({
	patientId,
}: { patientId?: number } = {}) => {
	const { data } = useRecords()

	const records = useMemo(() => {
		if (!patientId) return data
		return data.filter(record => {
			return record.patientId === patientId
		})
	}, [data, patientId])

	const summary = useMemo(() => {
		return records.reduce(
			(acc, record) => {
				if ($d().isSame(record.date, 'month')) {
					acc.thisMonth += record.amount
				}
				if ($d().isSame(record.date, 'year')) {
					acc.thisYear += record.amount
				}
				acc.total += record.amount

				recordTypes.forEach(type => {
					if (record.type === type.value) {
						acc.types[type.value] = (acc.types[type.value] ?? 0) + record.amount
					}
				})

				return acc
			},
			{
				total: 0,
				thisMonth: 0,
				thisYear: 0,
				types: {} as Record<string, number>,
			},
		)
	}, [records])

	return {
		summary,
	}
}
