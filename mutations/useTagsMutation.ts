import { useMutation } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/drizzle/db'
import { tags } from '@/drizzle/schema'

export type TZTag = z.infer<typeof zTag>
export const zTag = z.object({
	id: z.number().nullish(),
	name: z.string().min(1, 'Name is required'),
})

export const useTagsMutation = () => {
	return useMutation({
		mutationFn: async (data: TZTag) => {
			const name = data.name.trim()
			if (!name) {
				throw new Error('Name is required')
			}
			const { id } = data
			if (id) {
				const existing = await db.query.tags.findFirst({
					where: (v, { eq }) => eq(v.id, id),
				})
				if (!existing) {
					throw new Error('Tag not found')
				}
				return (
					await db
						.update(tags)
						.set({ name })
						.where(eq(tags.id, id))
						.returning()
				)[0]
			}
			const existing = await db.query.tags.findFirst({
				where: (v, { eq }) => eq(v.name, name),
			})
			if (existing) return existing
			return (await db.insert(tags).values({ name }).returning())[0]
		},
	})
}
