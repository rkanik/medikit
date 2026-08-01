import { useMutation } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import { db } from '@/drizzle/db'
import { patientPregnancies } from '@/drizzle/schema'

export const usePatientPregnancyDeleteMutation = () => {
	return useMutation({
		mutationFn: async (id: number) => {
			await db.delete(patientPregnancies).where(eq(patientPregnancies.id, id))
		},
	})
}
