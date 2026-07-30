import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'
import { mapPatient } from '@/queries/mapPatient'

export const usePatientPregnancyByIdQuery = (id: number) => {
	return useQuery({
		queryKey: ['patient-pregnancies', id],
		queryFn: async () => {
			if (isNaN(id)) return null
			const item = await db.query.patientPregnancies.findFirst({
				where: (v, { eq }) => eq(v.id, id),
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
			if (!item) return null
			return {
				...item,
				children: item.children?.map(link => ({
					...link,
					child: mapPatient(link.child),
				})),
			}
		},
	})
}
