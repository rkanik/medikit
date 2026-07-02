import type { TMaybe } from '@/types'

import { useMutation } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/drizzle/db'
import { attachables, records, taggablesTable } from '@/drizzle/schema'

import { useAttachmentsDeleteMutation } from './useAttachmentsDeleteMutation'
import { useAttachmentsMutation, zAttachment } from './useAttachmentsMutation'

export type TZRecord = z.infer<typeof zRecord>
export const zRecord = z.object({
	id: z.number().nullish(),
	patientId: z.number(),
	text: z.string().nullish(),
	date: z.string().min(1, 'Date is required!'),
	amount: z.number().default(0),
	tags: z.array(z.number()).default([]),
	attachments: z.array(zAttachment).default([]),
})

export const useRecordsMutation = () => {
	const { mutateAsync: mutateAttachment } = useAttachmentsMutation()
	const { mutateAsync: deleteAttachment } = useAttachmentsDeleteMutation()

	return useMutation({
		mutationFn: async (data: TZRecord) => {
			const values = {
				text: data.text,
				date: data.date,
				amount: data.amount,
				patientId: data.patientId,
			}
			const id = data.id

			const syncAttachments = async (recordId: number) => {
				const existingAttachables = id
					? await db.query.attachables.findMany({
							where: (v, { eq }) => eq(v.recordId, recordId),
							with: { attachment: true },
						})
					: []

				for (const attachable of existingAttachables) {
					const stillExists = data.attachments.some(attachment => {
						if (attachment.id) {
							return attachment.id === attachable.attachmentId
						}
						return false
					})
					if (!stillExists && attachable.attachmentId) {
						await deleteAttachment(attachable.attachmentId)
						await db
							.delete(attachables)
							.where(eq(attachables.id, attachable.id))
					}
				}

				for (const attachment of data.attachments) {
					if (
						attachment.id &&
						existingAttachables.some(
							item => item.attachmentId === attachment.id,
						)
					) {
						continue
					}
					const saved = await mutateAttachment(attachment)
					await db.insert(attachables).values({
						attachmentId: saved.id,
						recordId,
					})
				}
			}

			const syncTags = async (recordId: number) => {
				await db
					.delete(taggablesTable)
					.where(eq(taggablesTable.recordId, recordId))
				if (!data.tags.length) return
				await db.insert(taggablesTable).values(
					data.tags.map(tagId => ({
						tagId,
						recordId,
					})),
				)
			}

			if (id) {
				const existing = await db.query.records.findFirst({
					where: (v, { eq }) => eq(v.id, id),
				})
				if (!existing) {
					throw new Error('Record not found')
				}
				const result = await db
					.update(records)
					.set({
						...values,
						updatedAt: new Date().toISOString(),
					})
					.where(eq(records.id, id))
					.returning()
				await syncAttachments(id)
				await syncTags(id)
				return result[0]
			}

			const result = await db.insert(records).values(values).returning()
			const recordId = result[0]?.id
			if (!recordId) {
				throw new Error('Failed to save record')
			}
			await syncAttachments(recordId)
			await syncTags(recordId)
			return result[0]
		},
	})
}
