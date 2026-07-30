import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'
import { mapPatient } from '@/queries/mapPatient'

type TUsePatientPregnanciesQuery = {
	patientId: number
}

export const usePatientPregnanciesQuery = ({
	patientId,
}: TUsePatientPregnanciesQuery) => {
	return useQuery({
		queryKey: ['patient-pregnancies', patientId],
		initialData: [],
		queryFn: async () => {
			if (isNaN(patientId)) return []
			const items = await db.query.patientPregnancies.findMany({
				where: (v, { eq }) => eq(v.patientId, patientId),
				orderBy: (v, { desc }) => [desc(v.expectedDate), desc(v.startDate)],
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
			return items.map(item => ({
				...item,
				children: item.children?.map(link => ({
					...link,
					child: mapPatient(link.child),
				})),
			}))
		},
	})
}

export const useInvalidatePatientPregnanciesQuery = () => {
	const queryClient = useQueryClient()
	return useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['patient-pregnancies'] })
	}, [queryClient])
}
