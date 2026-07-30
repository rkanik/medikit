import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'

export const usePatientTimelineByIdQuery = (id: number) => {
	return useQuery({
		queryKey: ['patient-timeline', id],
		queryFn: async () => {
			if (isNaN(id)) return null
			return (
				(await db.query.patientTimelineEntries.findFirst({
					where: (v, { eq }) => eq(v.id, id),
					with: {
						values: true,
					},
				})) ?? null
			)
		},
	})
}
