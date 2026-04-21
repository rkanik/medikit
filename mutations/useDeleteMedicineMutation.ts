import { useMutation } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'

import { db } from '@/drizzle/db'
import { medicines } from '@/drizzle/schema'

import { useAttachmentsDeleteMutation } from './useAttachmentsDeleteMutation'

export const useDeleteMedicineMutation = () => {
	const { mutateAsync: deleteAttachment } = useAttachmentsDeleteMutation()

	return useMutation({
		mutationFn: async (id: number) => {
			const used = await db.query.patientMedicines.findFirst({
				where: (v, { eq }) => eq(v.medicineId, id),
			})
			if (used) {
				throw new Error(
					'This medicine is assigned to a patient and cannot be removed.',
				)
			}

			const existing = await db.query.medicines.findFirst({
				where: (v, { eq }) => eq(v.id, id),
			})
			if (!existing) return

			if (existing.thumbnailId) {
				await deleteAttachment(existing.thumbnailId)
			}

			await db.delete(medicines).where(eq(medicines.id, id))
		},
	})
}
