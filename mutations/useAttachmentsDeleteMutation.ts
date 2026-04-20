import { useMutation } from '@tanstack/react-query'
import { inArray } from 'drizzle-orm'

import { db } from '@/drizzle/db'
import { attachments } from '@/drizzle/schema'
import { fs } from '@/utils/fs'
import { paths } from '@/utils/paths'

export const useAttachmentsDeleteMutation = () => {
	return useMutation({
		mutationFn: async (id: number | number[]) => {
			const ids = Array.isArray(id) ? id : [id]
			const items = await db.query.attachments.findMany({
				where: (v, { inArray }) => inArray(v.id, ids),
			})
			if (!items.length) return
			fs.removeMany(items.map(v => paths.document(v.uri)))
			await db.delete(attachments).where(inArray(attachments.id, ids))
		},
	})
}
