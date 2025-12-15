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

				recordTypes.forEach(type => {
					if (record.type === type.value) {
						acc.types[type.value] = (acc.types[type.value] ?? 0) + record.amount
					}
				})

				if (index === records.length - 1) {
					const totalMonths = $d().diff(
						records[records.length - 1].date,
						'month',
					)
					acc.monthlyAverage = acc.total / totalMonths

					const totalYears = $d().diff(records[records.length - 1].date, 'year')
					acc.yearlyAverage = acc.total / totalYears
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
				types: {} as Record<string, number>,
			},
		)
	}, [records])

	return {
		summary,
	}
}
