import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'
import { mapPatient } from '@/queries/mapPatient'
import type { TPatient } from '@/types/database'

export type TPatientFamilyBaby = {
	patient: TPatient
	father: TPatient | null
}

export type TPatientFamilyParent = {
	patient: TPatient
	role: 'Mother' | 'Father'
}

export type TPatientFamily = {
	parents: TPatientFamilyParent[]
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

/** Parents, spouses + babies via pregnancies. */
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
			const asChild = await db.query.pregnancyChildren.findMany({
				where: (v, { eq: equals }) => equals(v.childPatientId, patientId),
				with: {
					pregnancy: {
						with: {
							patient: { with: { avatar: true } },
							father: { with: { avatar: true } },
						},
					},
				},
			})

			const parentsById = new Map<number, TPatientFamilyParent>()
			const spousesById = new Map<number, TPatient>()
			const babiesById = new Map<number, TPatientFamilyBaby>()

			for (const link of asChild) {
				const mother = mapPatient(link.pregnancy?.patient) ?? null
				const father = mapPatient(link.pregnancy?.father) ?? null
				if (mother?.id != null) {
					parentsById.set(mother.id, { patient: mother, role: 'Mother' })
				}
				if (father?.id != null) {
					parentsById.set(father.id, { patient: father, role: 'Father' })
				}
			}

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

			const parents = [...parentsById.values()].sort((a, b) => {
				if (a.role === b.role) return 0
				return a.role === 'Mother' ? -1 : 1
			})

			return {
				parents,
				spouses: [...spousesById.values()],
				babies: [...babiesById.values()],
			}
		},
	})
}
