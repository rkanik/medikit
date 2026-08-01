import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'
import { mapPatient } from '@/queries/mapPatient'
import type { TPatient } from '@/types/database'

export type TPatientFamilyBaby = {
	patient: TPatient
	father: TPatient | null
}

export type TPatientFamily = {
	spouses: TPatient[]
	babies: TPatientFamilyBaby[]
}

const pregnancyWith = {
	patient: { with: { avatar: true } },
	father: { with: { avatar: true } },
	children: {
		with: {
			child: { with: { avatar: true } },
		},
	},
} as const

/** Spouses + babies via pregnancies (as mother or father). */
export const usePatientFamilyQuery = (patientId: number) => {
	return useQuery({
		queryKey: ['patient-family', patientId],
		enabled: Number.isFinite(patientId) && patientId > 0,
		queryFn: async (): Promise<TPatientFamily> => {
			const asMother = await db.query.patientPregnancies.findMany({
				where: (v, { eq: equals }) => equals(v.patientId, patientId),
				with: pregnancyWith,
			})
			const asFather = await db.query.patientPregnancies.findMany({
				where: (v, { eq: equals }) => equals(v.fatherPatientId, patientId),
				with: pregnancyWith,
			})

			const spousesById = new Map<number, TPatient>()
			const babiesById = new Map<number, TPatientFamilyBaby>()

			for (const pregnancy of asMother) {
				const father = mapPatient(pregnancy.father) ?? null
				if (father?.id != null) {
					spousesById.set(father.id, father)
				}
				for (const link of pregnancy.children ?? []) {
					const child = mapPatient(link.child)
					if (child?.id == null) continue
					babiesById.set(child.id, { patient: child, father })
				}
			}

			for (const pregnancy of asFather) {
				const mother = mapPatient(pregnancy.patient) ?? null
				if (mother?.id != null) {
					spousesById.set(mother.id, mother)
				}
				const father = mapPatient(pregnancy.father) ?? null
				for (const link of pregnancy.children ?? []) {
					const child = mapPatient(link.child)
					if (child?.id == null) continue
					babiesById.set(child.id, { patient: child, father })
				}
			}

			return {
				spouses: [...spousesById.values()],
				babies: [...babiesById.values()],
			}
		},
	})
}
