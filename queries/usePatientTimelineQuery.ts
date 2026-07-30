import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'

type TUsePatientTimelineQuery = {
	patientId: number
}

export const usePatientTimelineQuery = ({
	patientId,
}: TUsePatientTimelineQuery) => {
	return useQuery({
		queryKey: ['patient-timeline', patientId],
		initialData: [],
		queryFn: async () => {
			if (isNaN(patientId)) return []
			const items = await db.query.patientTimelineEntries.findMany({
				where: (v, { eq }) => eq(v.patientId, patientId),
				orderBy: (v, { desc }) => [desc(v.date)],
				with: {
					values: true,
				},
			})
			return items
		},
	})
}

export const useInvalidatePatientTimelineQuery = () => {
	const queryClient = useQueryClient()
	return useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['patient-timeline'] })
	}, [queryClient])
}
