import type { TRecord } from '@/types/database'

import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'
import { paths } from '@/utils/paths'

const mapRecord = (
	record: NonNullable<Awaited<ReturnType<typeof fetchRecordById>>>,
): TRecord => {
	return {
		...record,
		tags: record.taggables?.map(item => item.tag?.name).filter(Boolean) as string[],
		attachments:
			record.attachables
				?.map(item => ({
					...item.attachment!,
					uri: paths.document(item.attachment?.uri),
				}))
				.filter(item => !!item.uri) ?? [],
	}
}

const fetchRecordById = async (id: number) => {
	return db.query.records.findFirst({
		where: (v, { eq }) => eq(v.id, id),
		with: {
			patient: {
				with: {
					avatar: true,
				},
			},
			taggables: {
				with: {
					tag: true,
				},
			},
			attachables: {
				with: {
					attachment: true,
				},
			},
		},
	})
}

export const useRecordByIdQuery = (id: number) => {
	return useQuery({
		queryKey: ['records', id],
		queryFn: async () => {
			if (isNaN(id)) return null
			const record = await fetchRecordById(id)
			return record ? mapRecord(record) : null
		},
	})
}

export const getRecordTagIds = (record: TRecord | null | undefined) => {
	return (
		record?.taggables
			?.map(item => item.tagId)
			.filter((tagId): tagId is number => typeof tagId === 'number') ?? []
	)
}
