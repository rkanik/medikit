import type { TPaginated } from '@/types'
import type { TPatientPregnancy } from '@/types/database'
import { useCallback } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { count, eq } from 'drizzle-orm'
import { db } from '@/drizzle/db'
import { patientPregnancies } from '@/drizzle/schema'
import { mapPatient } from '@/queries/mapPatient'
import { getPagination } from '@/utils/getPagination'

type TUsePatientPregnanciesQuery = {
	patientId: number
	page?: number
	perPage?: number
}

export const usePatientPregnanciesQuery = ({
	patientId,
	page = 1,
	perPage = 10,
}: TUsePatientPregnanciesQuery) => {
	return useInfiniteQuery({
		queryKey: ['patient-pregnancies', patientId, { perPage }],
		initialPageParam: page,
		initialData: {
			pages: [],
			pageParams: [],
		},
		getNextPageParam: (pageData: TPaginated<TPatientPregnancy>) => {
			return pageData.nextPage
		},
		getPreviousPageParam: (pageData: TPaginated<TPatientPregnancy>) => {
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
				.from(patientPregnancies)
				.where(eq(patientPregnancies.patientId, patientId))

			const items = await db.query.patientPregnancies.findMany({
				where: (v, { eq: equals }) => equals(v.patientId, patientId),
				orderBy: (v, { desc }) => [desc(v.expectedDate), desc(v.startDate)],
				limit,
				offset,
				with: {
					children: {
						with: {
							child: {
								with: {
									avatar: true,
								},
							},
						},
					},
				},
			})

			return paginate(
				items.map(item => ({
					...item,
					children: item.children?.map(link => ({
						...link,
						child: mapPatient(link.child),
					})),
				})),
				total,
			)
		},
	})
}

export const useInvalidatePatientPregnanciesQuery = () => {
	const queryClient = useQueryClient()
	return useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['patient-pregnancies'] })
		queryClient.invalidateQueries({ queryKey: ['linkable-pregnancy-patients'] })
	}, [queryClient])
}
