import type { TMaybe } from '@/types'

import { useMutation } from '@tanstack/react-query'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/drizzle/db'
import {
	patientPregnancies,
	patients,
	pregnancyChildren,
} from '@/drizzle/schema'

import { useAttachmentsDeleteMutation } from './useAttachmentsDeleteMutation'
import { useAttachmentsMutation, zAttachment } from './useAttachmentsMutation'

export type TZPatient = z.infer<typeof zPatient>
export const zPatient = z.object({
	id: z.number().nullish(),
	dob: z.string().nullish(),
	gender: z.string().nullish(),
	name: z.string().min(1, 'Name is required!'),
	avatar: zAttachment.nullish(),
})

export const usePatientsMutation = () => {
	const { mutateAsync: mutateAttachment } = useAttachmentsMutation()
	const { mutateAsync: deleteAttachment } = useAttachmentsDeleteMutation()
	return useMutation({
		mutationFn: async (data: TZPatient) => {
			let avatarId: TMaybe<number> = null
			if (data.avatar) {
				try {
					avatarId = (await mutateAttachment(data.avatar)).id
				} catch {}
			}
			const values = {
				name: data.name,
				dob: data.dob,
				gender: data.gender,
				avatarId,
			}
			const id = data.id
			if (id) {
				const existing = await db.query.patients.findFirst({
					where: (v, { eq }) => eq(v.id, id),
				})
				if (!existing) {
					throw new Error('Patient not found')
				}
				if (existing.avatarId && existing.avatarId !== data.avatar?.id) {
					await deleteAttachment(existing.avatarId)
				}
				const result = await db
					.update(patients)
					.set({
						...values,
						updatedAt: new Date().toISOString(),
					})
					.where(eq(patients.id, id))
					.returning()

				// Baby DOB is the pregnancy delivery date
				if (data.dob) {
					const links = await db
						.select({ pregnancyId: pregnancyChildren.pregnancyId })
						.from(pregnancyChildren)
						.where(eq(pregnancyChildren.childPatientId, id))
					const pregnancyIds = [
						...new Set(links.map(link => link.pregnancyId)),
					]
					if (pregnancyIds.length) {
						await db
							.update(patientPregnancies)
							.set({
								deliveryDate: data.dob,
								updatedAt: new Date().toISOString(),
							})
							.where(inArray(patientPregnancies.id, pregnancyIds))
					}
				}

				return result[0]
			}
			const result = await db.insert(patients).values(values).returning()
			return result[0]
		},
	})
}
