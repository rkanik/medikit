import { eq } from 'drizzle-orm'

import { db } from '@/drizzle/db'
import { patients } from '@/drizzle/schema'
import { useQuery } from '@/hooks/useQuery'

export const usePatientByIdQuery = (id: number) => {
	return useQuery({
		queryKey: ['patients', id],
		async queryFn() {
			return db.query.patients.findFirst({
				where: eq(patients.id, id),
				with: {
					avatar: true,
				},
			})
		},
	})
}
