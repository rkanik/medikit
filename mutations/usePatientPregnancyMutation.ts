import { useMutation } from '@tanstack/react-query'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/drizzle/db'
import {
	patientPregnancies,
	patients,
	pregnancyChildren,
} from '@/drizzle/schema'

export type TZPatientPregnancy = z.infer<typeof zPatientPregnancy>
export const zPatientPregnancy = z.object({
	id: z.number().nullish(),
	patientId: z.number(),
	fatherPatientId: z.number().nullish(),
	expectedDate: z.string().nullish(),
	deliveryDate: z.string().nullish(),
	childIds: z.array(z.number()).default([]),
})

export const usePatientPregnancyMutation = () => {
	return useMutation({
		mutationFn: async (data: TZPatientPregnancy) => {
			const values = {
				patientId: data.patientId,
				fatherPatientId: data.fatherPatientId || null,
				startDate: null,
				expectedDate: data.expectedDate || null,
				deliveryDate: data.deliveryDate || null,
				note: null,
			}

			let pregnancyId = data.id ?? null

			if (pregnancyId) {
				await db
					.update(patientPregnancies)
					.set({
						...values,
						updatedAt: new Date().toISOString(),
					})
					.where(eq(patientPregnancies.id, pregnancyId))

				await db
					.delete(pregnancyChildren)
					.where(eq(pregnancyChildren.pregnancyId, pregnancyId))
			} else {
				const created = await db
					.insert(patientPregnancies)
					.values(values)
					.returning()
				pregnancyId = created[0]?.id ?? null
			}

			if (!pregnancyId) {
				throw new Error('Failed to save pregnancy')
			}

			const childIds = [...new Set(data.childIds.filter(Boolean))]
			if (childIds.length) {
				await db.insert(pregnancyChildren).values(
					childIds.map(childPatientId => ({
						pregnancyId,
						childPatientId,
					})),
				)
			}

			// Delivery date is the babies' date of birth
			if (data.deliveryDate && childIds.length) {
				await db
					.update(patients)
					.set({
						dob: data.deliveryDate,
						updatedAt: new Date().toISOString(),
					})
					.where(inArray(patients.id, childIds))
			}

			return (
				(await db.query.patientPregnancies.findFirst({
					where: (v, { eq: equals }) => equals(v.id, pregnancyId!),
					with: {
						father: {
							with: { avatar: true },
						},
						children: {
							with: {
								child: {
									with: { avatar: true },
								},
							},
						},
					},
				})) ?? null
			)
		},
	})
}
