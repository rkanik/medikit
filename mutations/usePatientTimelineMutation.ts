import { useMutation } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/drizzle/db'
import {
	patientTimelineEntries,
	patientTimelineValues,
} from '@/drizzle/schema'

export type TZPatientTimelineEntry = z.infer<typeof zPatientTimelineEntry>
export const zPatientTimelineEntry = z.object({
	id: z.number().nullish(),
	patientId: z.number(),
	date: z.string().min(1, 'Date is required!'),
	note: z.string().nullish(),
	values: z
		.array(
			z.object({
				key: z.string().min(1),
				value: z.string().min(1),
				unit: z.string().nullish(),
			}),
		)
		.default([]),
})

export const usePatientTimelineMutation = () => {
	return useMutation({
		mutationFn: async (data: TZPatientTimelineEntry) => {
			const values = {
				patientId: data.patientId,
				date: data.date,
				note: data.note?.trim() || null,
			}

			let entryId = data.id ?? null

			if (entryId) {
				await db
					.update(patientTimelineEntries)
					.set({
						...values,
						updatedAt: new Date().toISOString(),
					})
					.where(eq(patientTimelineEntries.id, entryId))

				await db
					.delete(patientTimelineValues)
					.where(eq(patientTimelineValues.entryId, entryId))
			} else {
				const created = await db
					.insert(patientTimelineEntries)
					.values(values)
					.returning()
				entryId = created[0]?.id ?? null
			}

			if (!entryId) {
				throw new Error('Failed to save timeline entry')
			}

			const metricValues = data.values
				.map(item => ({
					entryId,
					key: item.key,
					value: item.value.trim(),
					unit: item.unit?.trim() || null,
				}))
				.filter(item => item.value.length > 0)

			if (metricValues.length) {
				await db.insert(patientTimelineValues).values(metricValues)
			}

			return (
				(await db.query.patientTimelineEntries.findFirst({
					where: (v, { eq: equals }) => equals(v.id, entryId!),
					with: { values: true },
				})) ?? null
			)
		},
	})
}
