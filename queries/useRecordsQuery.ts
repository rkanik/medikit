import type { TRecord } from '@/types/database'
import type { TPaginated } from '@/types'

import { useCallback, useMemo } from 'react'

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { count, eq } from 'drizzle-orm'

import { db } from '@/drizzle/db'
import { records as recordsTable } from '@/drizzle/schema'
import { mapPatient } from '@/queries/mapPatient'
import { getPagination } from '@/utils/getPagination'
import { $d } from '@/utils/dayjs'
import { paths } from '@/utils/paths'

export type TRecordsQuery = {
	q?: string
	patientId?: number
	page?: number
	perPage?: number
}

const mapRecord = (record: NonNullable<Awaited<ReturnType<typeof fetchRecords>>[number]>): TRecord => {
	return {
		...record,
		patient: mapPatient(record.patient),
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
	const page = query.page ?? 1
	const { offset, limit } = getPagination({
		page,
		perPage: query.perPage ?? 10,
	})
	const records = await db.query.records.findMany({
		limit,
		offset,
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
	const result = useInfiniteQuery({
		queryKey: ['records', query],
		initialPageParam: query.page ?? 1,
		initialData: {
			pages: [],
			pageParams: [],
		},
		getNextPageParam: (page: TPaginated<TRecord>) => page.nextPage,
		getPreviousPageParam: (page: TPaginated<TRecord>) => page.previousPage,
		queryFn: async ({ pageParam }) => {
			const page = Number(pageParam)
			const [{ total }] = await db
				.select({ total: count() })
				.from(recordsTable)
				.where(
					query.patientId ? eq(recordsTable.patientId, query.patientId) : undefined,
				)
			const { paginate } = getPagination({
				page,
				perPage: query.perPage ?? 10,
			})
			const records = await fetchRecords({
				...query,
				page,
			})
			return paginate(filterRecords(records.map(mapRecord), query), total)
		},
	})

	const data = useMemo(() => {
		return (result.data?.pages ?? []).flatMap(page => page.data ?? [])
	}, [result.data?.pages])

	return { ...result, data }
}

export const useInvalidateRecordsQuery = () => {
	const queryClient = useQueryClient()
	return useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['records'] })
	}, [queryClient])
}
