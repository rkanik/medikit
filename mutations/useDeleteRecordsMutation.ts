import { useMutation } from '@tanstack/react-query'
import { inArray } from 'drizzle-orm'

import { db } from '@/drizzle/db'
import { attachables, records } from '@/drizzle/schema'

import { useAttachmentsDeleteMutation } from './useAttachmentsDeleteMutation'

export const useDeleteRecordsMutation = () => {
	const { mutateAsync: deleteAttachments } = useAttachmentsDeleteMutation()

	return useMutation({
		mutationFn: async (id: number | number[]) => {
			const ids = Array.isArray(id) ? id : [id]
			if (!ids.length) return

			const items = await db.query.records.findMany({
				where: (v, { inArray }) => inArray(v.id, ids),
				with: {
					attachables: true,
				},
			})
			if (!items.length) return

			const attachmentIds = items
				.flatMap(item => item.attachables ?? [])
				.map(item => item.attachmentId)
				.filter((v): v is number => typeof v === 'number')

			if (attachmentIds.length) {
				await deleteAttachments(attachmentIds)
			}

			await db.delete(attachables).where(inArray(attachables.recordId, ids))
			await db.delete(records).where(inArray(records.id, ids))
		},
	})
}
