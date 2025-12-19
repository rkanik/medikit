import { useMemo } from 'react'

import { useRecords } from '@/api/records'
import { $d } from '@/utils/dayjs'

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
			(acc, record, index, records) => {
				if ($d().isSame(record.date, 'month')) {
					acc.thisMonth += record.amount
				}
				if ($d().isSame(record.date, 'year')) {
					acc.thisYear += record.amount
				}
				if ($d().subtract(1, 'month').isSame(record.date, 'month')) {
					acc.lastMonth += record.amount
				}
				if ($d().subtract(6, 'month').isBefore(record.date, 'month')) {
					acc.last6Months += record.amount
				}
				if ($d().subtract(12, 'month').isBefore(record.date, 'month')) {
					acc.last12Months += record.amount
				}
				if ($d().subtract(1, 'year').isSame(record.date, 'year')) {
					acc.lastYear += record.amount
				}
				acc.total += record.amount

				record.tags?.forEach(tag => {
					acc.tags[tag] = (acc.tags[tag] ?? 0) + record.amount
				})

				if (index === records.length - 1) {
					const totalMonths = Math.ceil(
						$d().diff(records[records.length - 1].date, 'month', true),
					)
					const totalYears = Math.ceil(
						$d().diff(records[records.length - 1].date, 'year', true),
					)
					acc.monthlyAverage = Math.round(acc.total / totalMonths)
					acc.yearlyAverage = Math.round(acc.total / totalYears)
				}

				return acc
			},
			{
				total: 0,
				monthlyAverage: 0,
				thisMonth: 0,
				lastMonth: 0,
				last6Months: 0,
				last12Months: 0,
				thisYear: 0,
				lastYear: 0,
				yearlyAverage: 0,
				tags: {} as Record<string, number>,
			},
		)
	}, [records])

	return {
		summary,
	}
}
