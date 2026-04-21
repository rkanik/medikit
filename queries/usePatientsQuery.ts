import type { TPaginated } from '@/types'
import type { TPatient } from '@/types/database'

import { useCallback } from 'react'

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { count } from 'drizzle-orm'

import { db } from '@/drizzle/db'
import { patients } from '@/drizzle/schema'
import { getPagination } from '@/utils/getPagination'

export const usePatientsQuery = (query?: {
	page?: number
	perPage?: number
}) => {
	return useInfiniteQuery({
		queryKey: ['patients', query],
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
			console.log('usePatientsQuery', pageParam)
			const page = Number(pageParam)
			const { offset, limit, paginate } = getPagination({
				...query,
				page,
				perPage: query?.perPage,
			})
			const [{ total }] = await db.select({ total: count() }).from(patients)
			const data = await db.query.patients.findMany({
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
