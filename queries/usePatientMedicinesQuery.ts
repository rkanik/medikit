import type { TPaginated } from '@/types'
import type { TPatientMedicine } from '@/types/database'
import { useCallback } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { count, eq } from 'drizzle-orm'
import { db } from '@/drizzle/db'
import { patientMedicines } from '@/drizzle/schema'
import { getPagination } from '@/utils/getPagination'

type TUsePatientMedicinesQuery = {
	patientId: number
	page?: number
	perPage?: number
}

export const usePatientMedicinesQuery = ({
	patientId,
	page = 1,
	perPage = 10,
}: TUsePatientMedicinesQuery) => {
	return useInfiniteQuery({
		queryKey: ['patient-medicines', patientId, { perPage }],
		initialPageParam: page,
		initialData: {
			pages: [],
			pageParams: [],
		},
		getNextPageParam: (pageData: TPaginated<TPatientMedicine>) => {
			return pageData.nextPage
		},
		getPreviousPageParam: (pageData: TPaginated<TPatientMedicine>) => {
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
				.from(patientMedicines)
				.where(eq(patientMedicines.patientId, patientId))

			const items = await db.query.patientMedicines.findMany({
				where: (v, { eq: equals }) => equals(v.patientId, patientId),
				orderBy: (v, { desc }) => [desc(v.startDate)],
				limit,
				offset,
				with: {
					medicine: {
						with: {
							thumbnail: true,
							attachables: true,
						},
					},
				},
			})

			return paginate(items, total)
		},
	})
}

export const useInvalidatePatientMedicinesQuery = () => {
	const queryClient = useQueryClient()
	return useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['patient-medicines'] })
	}, [queryClient])
}
