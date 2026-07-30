import { useMutation } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import { db } from '@/drizzle/db'
import { patientTimelineEntries } from '@/drizzle/schema'

export const usePatientTimelineDeleteMutation = () => {
	return useMutation({
		mutationFn: async (id: number) => {
			await db
				.delete(patientTimelineEntries)
				.where(eq(patientTimelineEntries.id, id))
		},
	})
}
