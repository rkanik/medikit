import { useMutation } from '@tanstack/react-query'
import { inArray } from 'drizzle-orm'

import { db } from '@/drizzle/db'
import { patients } from '@/drizzle/schema'

import { useAttachmentsDeleteMutation } from './useAttachmentsDeleteMutation'

export const useDeletePatientsMutation = () => {
	const { mutateAsync: deleteAttachments } = useAttachmentsDeleteMutation()

	return useMutation({
		mutationFn: async (id: number | number[]) => {
			const ids = Array.isArray(id) ? id : [id]
			if (!ids.length) return
			const items = await db.query.patients.findMany({
				where: (v, { inArray }) => inArray(v.id, ids),
			})
			if (!items.length) return
			await deleteAttachments(
				items
					.map(v => v.avatarId)
					.filter((v): v is number => typeof v === 'number'),
			)
			await db.delete(patients).where(inArray(patients.id, ids))
		},
	})
}
