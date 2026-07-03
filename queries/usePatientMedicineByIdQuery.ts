import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'

export const usePatientMedicineByIdQuery = (id: number) => {
	return useQuery({
		queryKey: ['patient-medicines', id],
		queryFn: async () => {
			if (isNaN(id)) return null
			return (
				(await db.query.patientMedicines.findFirst({
					where: (v, { eq }) => eq(v.id, id),
					with: {
						medicine: {
							with: {
								thumbnail: true,
							},
						},
					},
				})) ?? null
			)
		},
	})
}
