import type { TPaginated } from '@/types'
import type { TPatient } from '@/types/database'
import { useCallback } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { and, count, eq, inArray, isNotNull, type SQL } from 'drizzle-orm'
import { db } from '@/drizzle/db'
import { patients, records } from '@/drizzle/schema'
import { getPagination } from '@/utils/getPagination'

export type TPatientsQuery = {
	page?: number
	perPage?: number
	/** When false (default), only public patients. When true, include private. */
	includePrivate?: boolean
	/** When true, only patients that have at least one record. */
	withRecords?: boolean
}

export const usePatientsQuery = (query?: TPatientsQuery) => {
	const includePrivate = query?.includePrivate === true
	const withRecords = query?.withRecords === true
	return useInfiniteQuery({
		queryKey: ['patients', { ...query, includePrivate, withRecords }],
		initialPageParam: query?.page ?? 1,
		initialData: {
			pages: [],
			pageParams: [],
		},
		getNextPageParam: (page: TPaginated<TPatient>) => {
			return page.nextPage
		},
		getPreviousPageParam: (page: TPaginated<TPatient>) => {
			return page.previousPage
		},
		queryFn: async ({ pageParam }) => {
			const page = Number(pageParam)
			const { offset, limit, paginate } = getPagination({
				...query,
				page,
				perPage: query?.perPage,
			})
			const publicOnly = !includePrivate
			const conditions: SQL[] = []

			if (publicOnly) {
				conditions.push(eq(patients.public, true))
			}

			if (withRecords) {
				const linked = await db
					.selectDistinct({ patientId: records.patientId })
					.from(records)
					.where(isNotNull(records.patientId))
				const ids = linked
					.map(row => row.patientId)
					.filter((id): id is number => id != null)
				if (!ids.length) {
					return paginate([], 0)
				}
				conditions.push(inArray(patients.id, ids))
			}

			const where = conditions.length ? and(...conditions) : undefined

			const [{ total }] = await db
				.select({ total: count() })
				.from(patients)
				.where(where)
			const data = await db.query.patients.findMany({
				where: where ? () => where : undefined,
				limit,
				offset,
				orderBy: (v, { asc }) => [asc(v.createdAt)],
				with: {
					avatar: true,
				},
			})
			return paginate(data, total)
		},
	})
}

export const useInvalidatePatientsQuery = () => {
	const queryClient = useQueryClient()
	return useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['patients'] })
	}, [queryClient])
}
