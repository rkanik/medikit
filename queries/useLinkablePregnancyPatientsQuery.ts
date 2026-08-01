import { and, ne, notInArray } from 'drizzle-orm'
import { db } from '@/drizzle/db'
import { patients, pregnancyChildren } from '@/drizzle/schema'
import { useQuery } from '@/hooks/useQuery'
import { mapPatient } from '@/queries/mapPatient'

export const LINKABLE_PREGNANCY_PATIENTS_KEY = [
	'linkable-pregnancy-patients',
] as const

type TArgs = {
	excludePatientId: number
	excludePregnancyId?: number | null
}

/** Patients who are not the mother and not linked to another pregnancy. */
export const useLinkablePregnancyPatientsQuery = ({
	excludePatientId,
	excludePregnancyId,
}: TArgs) => {
	return useQuery({
		queryKey: [
			...LINKABLE_PREGNANCY_PATIENTS_KEY,
			excludePatientId,
			excludePregnancyId ?? null,
		],
		enabled: Number.isFinite(excludePatientId),
		queryFn: async () => {
			const linkedRows = await db
				.select({
					childPatientId: pregnancyChildren.childPatientId,
					pregnancyId: pregnancyChildren.pregnancyId,
				})
				.from(pregnancyChildren)

			const linkedIds = [
				...new Set(
					linkedRows
						.filter(
							row =>
								excludePregnancyId == null ||
								row.pregnancyId !== excludePregnancyId,
						)
						.map(row => row.childPatientId),
				),
			]

			const items = await db.query.patients.findMany({
				where: () =>
					linkedIds.length
						? and(
								ne(patients.id, excludePatientId),
								notInArray(patients.id, linkedIds),
							)
						: ne(patients.id, excludePatientId),
				orderBy: (v, { asc }) => [asc(v.name)],
				with: {
					avatar: true,
				},
			})

			return items.map(item => mapPatient(item)!)
		},
	})
}
