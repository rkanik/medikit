import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'

export const usePatientByIdQuery = (id: number) => {
	return useQuery({
		queryKey: ['patients', id],
		queryFn: async () => {
			if (isNaN(id)) return null
			return (
				(await db.query.patients.findFirst({
					where: (v, { eq }) => eq(v.id, id),
					with: {
						avatar: true,
					},
				})) ?? null
			)
		},
	})
}
