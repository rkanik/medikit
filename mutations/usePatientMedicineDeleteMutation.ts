import { useMutation } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'

import { db } from '@/drizzle/db'
import { patientMedicines } from '@/drizzle/schema'

export const usePatientMedicineDeleteMutation = () => {
	return useMutation({
		mutationFn: async (id: number) => {
			await db.delete(patientMedicines).where(eq(patientMedicines.id, id))
		},
	})
}
