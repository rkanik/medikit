import type { TPaginated } from '@/types'
import type { TPatientTimelineEntry } from '@/types/database'
import { useCallback } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { count, eq } from 'drizzle-orm'
import { db } from '@/drizzle/db'
import { patientTimelineEntries } from '@/drizzle/schema'
import { getPagination } from '@/utils/getPagination'

type TUsePatientTimelineQuery = {
	patientId: number
	page?: number
	perPage?: number
}

export const usePatientTimelineQuery = ({
	patientId,
	page = 1,
	perPage = 10,
}: TUsePatientTimelineQuery) => {
	return useInfiniteQuery({
		queryKey: ['patient-timeline', patientId, { perPage }],
		initialPageParam: page,
		initialData: {
			pages: [],
			pageParams: [],
		},
		getNextPageParam: (pageData: TPaginated<TPatientTimelineEntry>) => {
			return pageData.nextPage
		},
		getPreviousPageParam: (pageData: TPaginated<TPatientTimelineEntry>) => {
			return pageData.previousPage
		},
		queryFn: async ({ pageParam }) => {
			if (isNaN(patientId)) {
				return getPagination({ page: 1, perPage }).paginate([], 0)
			}
			const currentPage = Number(pageParam)
			const { offset, limit, paginate } = getPagination({
				page: currentPage,
				perPage,
			})
			const [{ total }] = await db
				.select({ total: count() })
				.from(patientTimelineEntries)
				.where(eq(patientTimelineEntries.patientId, patientId))

			const items = await db.query.patientTimelineEntries.findMany({
				where: (v, { eq: equals }) => equals(v.patientId, patientId),
				orderBy: (v, { desc }) => [desc(v.date)],
				limit,
				offset,
				with: {
					values: true,
				},
			})
			return paginate(items, total)
		},
	})
}

export const useInvalidatePatientTimelineQuery = () => {
	const queryClient = useQueryClient()
	return useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['patient-timeline'] })
	}, [queryClient])
}
