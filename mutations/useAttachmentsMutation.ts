import { useMutation } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import { Paths } from 'expo-file-system'
import { z } from 'zod'

import { db } from '@/drizzle/db'
import { attachments } from '@/drizzle/schema'
import { fs } from '@/utils/fs'
import { paths } from '@/utils/paths'

export type TZAttachment = z.infer<typeof zAttachment>
export const zAttachment = z.object({
	id: z.number().nullish(),
	uri: z.string().min(1, 'Uri is required!'),
	name: z.string().nullish(),
	mime: z.string().nullish(),
	size: z.number().nullish(),
})

export const useAttachmentsMutation = () => {
	return useMutation({
		mutationFn: async (data: TZAttachment) => {
			const values = {
				uri: '',
				name: data.name,
				mime: data.mime,
				size: data.size,
			}
			const id = data.id
			if (id) {
				const existing = await db.query.attachments.findFirst({
					where: (v, { eq }) => eq(v.id, id),
				})
				if (!existing) {
					throw new Error('Attachment not found')
				}
				if (existing.uri === data.uri) {
					return existing
				}
				fs.remove(paths.document(existing.uri))
				const asset = fs.copyAssetTo('attachments', data)
				if (asset.data?.uri) {
					values.uri = asset.data.uri.replace(Paths.document.uri, '')
				}
				if (!values.uri) {
					throw new Error('Attachment URI is required')
				}
				return (
					await db
						.update(attachments)
						.set({
							...values,
							updatedAt: new Date().toISOString(),
						})
						.where(eq(attachments.id, id))
						.returning()
				)[0]
			}
			if (data.uri) {
				const asset = fs.copyAssetTo('attachments', data)
				if (asset.data?.uri) {
					values.uri = asset.data.uri.replace(Paths.document.uri, '')
				}
			}
			if (!values.uri) {
				throw new Error('Attachment URI is required')
			}
			return (await db.insert(attachments).values(values).returning())[0]
		},
	})
}
