import type { TRecord } from '@/types/database'

import { useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'
import { $d } from '@/utils/dayjs'
import { paths } from '@/utils/paths'

export type TRecordsQuery = {
	q?: string
	patientId?: number
}

const mapRecord = (record: NonNullable<Awaited<ReturnType<typeof fetchRecords>>[number]>): TRecord => {
	return {
		...record,
		tags: record.taggables?.map(item => item.tag?.name).filter(Boolean) as string[],
		attachments:
			record.attachables
				?.map(item => ({
					...item.attachment!,
					uri: paths.document(item.attachment?.uri),
				}))
				.filter(item => !!item.uri) ?? [],
	}
}

const fetchRecords = async (query: TRecordsQuery = {}) => {
	const patientId = query.patientId
	const records = await db.query.records.findMany({
		where: patientId
			? (v, { eq }) => eq(v.patientId, patientId)
			: undefined,
		orderBy: (v, { desc }) => [desc(v.date)],
		with: {
			patient: {
				with: {
					avatar: true,
				},
			},
			taggables: {
				with: {
					tag: true,
				},
			},
			attachables: {
				with: {
					attachment: true,
				},
			},
		},
	})
	return records
}

const filterRecords = (records: TRecord[], query: TRecordsQuery = {}) => {
	const q = query.q?.trim().toLowerCase() ?? ''
	if (!q) return records
	return records.filter(record => {
		return (
			record.text?.toLowerCase().includes(q) ||
			record.tags?.some(tag => tag.toLowerCase().includes(q)) ||
			['DD-MM-YYYY', 'YYYY-MM-DD'].some(format => {
				return $d(record.date).format(format).includes(q)
			})
		)
	})
}

export const useRecordsQuery = (query: TRecordsQuery = {}) => {
	const result = useQuery({
		queryKey: ['records', query],
		initialData: [],
		queryFn: async () => {
			const records = await fetchRecords(query)
			return filterRecords(records.map(mapRecord), query)
		},
	})

	const data = useMemo(() => result.data ?? [], [result.data])

	return { ...result, data }
}

export const useInvalidateRecordsQuery = () => {
	const queryClient = useQueryClient()
	return useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['records'] })
	}, [queryClient])
}
