import type { TMaybe } from '@/types'

import { useMutation } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/drizzle/db'
import { medicines, patientMedicines } from '@/drizzle/schema'

import { useAttachmentsDeleteMutation } from './useAttachmentsDeleteMutation'
import { useAttachmentsMutation, zAttachment } from './useAttachmentsMutation'

export type TZPatientMedicine = z.infer<typeof zPatientMedicine>
export const zPatientMedicine = z.object({
	id: z.number().nullish(),
	patientId: z.number(),
	startDate: z.string().nullish(),
	endDate: z.string().nullish(),
	schedule: z.string().nullish(),
	stock: z.number().nullish(),
	medicine: z.object({
		id: z.number().nullish(),
		name: z.string().min(1, 'Name is required!'),
		thumbnail: zAttachment.nullish(),
	}),
})

export const usePatientMedicineMutation = () => {
	const { mutateAsync: mutateAttachment } = useAttachmentsMutation()
	const { mutateAsync: deleteAttachment } = useAttachmentsDeleteMutation()

	return useMutation({
		mutationFn: async (data: TZPatientMedicine) => {
			const medicineName = data.medicine.name.trim()
			if (!medicineName) {
				throw new Error('Medicine name is required')
			}

			let medicineId: TMaybe<number> = data.medicine.id ?? null
			let existingMedicine =
				medicineId
					? await db.query.medicines.findFirst({
							where: (v, { eq }) => eq(v.id, medicineId),
						})
					: null

			if (!existingMedicine) {
				const allMedicines = await db.query.medicines.findMany()
				existingMedicine =
					allMedicines.find(
						v => v.name.trim().toLowerCase() === medicineName.toLowerCase(),
					) ?? null
				medicineId = existingMedicine?.id ?? null
			}

			let thumbnailId: TMaybe<number> = existingMedicine?.thumbnailId ?? null
			if (data.medicine.thumbnail) {
				thumbnailId = (await mutateAttachment(data.medicine.thumbnail)).id
				if (
					existingMedicine?.thumbnailId &&
					existingMedicine.thumbnailId !== thumbnailId
				) {
					await deleteAttachment(existingMedicine.thumbnailId)
				}
			}

			const medicineValues = {
				name: medicineName,
				thumbnailId,
			}

			if (medicineId) {
				await db
					.update(medicines)
					.set({
						...medicineValues,
						updatedAt: new Date().toISOString(),
					})
					.where(eq(medicines.id, medicineId))
			} else {
				const created = await db.insert(medicines).values(medicineValues).returning()
				medicineId = created[0]?.id
			}

			if (!medicineId) {
				throw new Error('Failed to save medicine')
			}

			const values = {
				patientId: data.patientId,
				medicineId,
				startDate: data.startDate,
				endDate: data.endDate,
				schedule: data.schedule,
				stock: data.stock,
			}

			if (data.id) {
				const updated = await db
					.update(patientMedicines)
					.set(values)
					.where(eq(patientMedicines.id, data.id))
					.returning()
				return updated[0]
			}

			const created = await db.insert(patientMedicines).values(values).returning()
			return created[0]
		},
	})
}
