import type { TPaginated } from '@/types'
import type { TRecord } from '@/types/database'
import { useCallback, useMemo } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
	and,
	count,
	eq,
	exists,
	like,
	or,
	sql,
	type SQL,
} from 'drizzle-orm'
import { db } from '@/drizzle/db'
import {
	records as recordsTable,
	taggablesTable,
	tags,
} from '@/drizzle/schema'
import { mapPatient } from '@/queries/mapPatient'
import { getPagination } from '@/utils/getPagination'
import { paths } from '@/utils/paths'

export type TRecordsQuery = {
	q?: string
	tag?: string
	patientId?: number
	page?: number
	perPage?: number
}

type TRecordsRef = Pick<typeof recordsTable, 'id' | 'patientId' | 'text' | 'date'>

const tagMatchExists = (records: TRecordsRef, tagName: string) =>
	exists(
		db
			.select({ id: taggablesTable.id })
			.from(taggablesTable)
			.innerJoin(tags, eq(taggablesTable.tagId, tags.id))
			.where(
				and(
					eq(taggablesTable.recordId, records.id),
					eq(tags.name, tagName),
				),
			),
	)

const tagSearchExists = (records: TRecordsRef, q: string) =>
	exists(
		db
			.select({ id: taggablesTable.id })
			.from(taggablesTable)
			.innerJoin(tags, eq(taggablesTable.tagId, tags.id))
			.where(
				and(
					eq(taggablesTable.recordId, records.id),
					like(sql`lower(${tags.name})`, `%${q}%`),
				),
			),
	)

const buildRecordsWhere = (
	records: TRecordsRef,
	query: TRecordsQuery,
): SQL | undefined => {
	const conditions: SQL[] = []

	if (query.patientId != null) {
		conditions.push(eq(records.patientId, query.patientId))
	}

	const tag = query.tag?.trim()
	if (tag) {
		conditions.push(tagMatchExists(records, tag))
	}

	const q = query.q?.trim().toLowerCase()
	if (q) {
		conditions.push(
			or(
				like(sql`lower(${records.text})`, `%${q}%`),
				like(records.date, `%${q}%`),
				like(sql`strftime('%d-%m-%Y', ${records.date})`, `%${q}%`),
				like(sql`strftime('%Y-%m-%d', ${records.date})`, `%${q}%`),
				tagSearchExists(records, q),
			)!,
		)
	}

	if (!conditions.length) return undefined
	return conditions.length === 1 ? conditions[0] : and(...conditions)
}

const mapRecord = (
	record: NonNullable<Awaited<ReturnType<typeof fetchRecords>>[number]>,
): TRecord => {
	return {
		...record,
		patient: mapPatient(record.patient),
		tags: record.taggables
			?.map(item => item.tag?.name)
			.filter(Boolean) as string[],
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
	const page = query.page ?? 1
	const { offset, limit } = getPagination({
		page,
		perPage: query.perPage ?? 10,
	})
	const records = await db.query.records.findMany({
		limit,
		offset,
		where: records => buildRecordsWhere(records, query),
		orderBy: (records, { desc }) => [desc(records.date)],
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
			const where = buildRecordsWhere(recordsTable, query)
			const [{ total }] = await db
				.select({ total: count() })
				.from(recordsTable)
				.where(where)

			const { paginate } = getPagination({
				page,
				perPage: query.perPage ?? 10,
			})
			const records = await fetchRecords({
				...query,
				page,
			})
			return paginate(records.map(mapRecord), total)
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
