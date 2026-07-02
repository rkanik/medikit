import type { TRecordsQuery } from '@/queries/useRecordsQuery'
import { useMemo } from 'react'
import { useRecordsQuery } from '@/queries/useRecordsQuery'
import { $d } from '@/utils/dayjs'

export type TRecordsSummary = {
	total: number
	monthlyAverage: number
	thisMonth: number
	lastMonth: number
	last6Months: number
	last12Months: number
	thisYear: number
	lastYear: number
	yearlyAverage: number
	tags: Record<string, number>
}

export const getSummaryStatItems = (summary: TRecordsSummary) => [
	{ label: 'Total', value: summary.total },
	{ label: 'Average (Monthly)', value: summary.monthlyAverage },
	{ label: 'Average (Yearly)', value: summary.yearlyAverage },
	{ label: 'This Month', value: summary.thisMonth },
	{ label: 'Last Month', value: summary.lastMonth },
	{ label: 'Last 6 Months', value: summary.last6Months },
	{ label: 'Last 12 Months', value: summary.last12Months },
	{ label: 'This Year', value: summary.thisYear },
	{ label: 'Last Year', value: summary.lastYear },
]

export const useRecordsSummary = (query: TRecordsQuery) => {
	const { data } = useRecordsQuery({
		...query,
		page: 1,
		perPage: 100000,
	})

	const summary = useMemo(() => {
		return data.reduce(
			(acc, record, index) => {
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

				if (index === data.length - 1) {
					const totalMonths = Math.ceil(
						$d().diff(data[data.length - 1].date, 'month', true),
					)
					const totalYears = Math.ceil(
						$d().diff(data[data.length - 1].date, 'year', true),
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
	}, [data])

	return {
		summary,
	}
}
