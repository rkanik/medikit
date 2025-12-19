import type { TMaybe } from '@/types'
import type { TRecord } from '@/types/database'

import { useCallback, useMemo } from 'react'
import { Alert } from 'react-native'

import { z } from 'zod'

import { useMMKVArray } from '@/hooks/useMMKVArray'
import { fs } from '@/utils/fs'

export type TZRecord = z.infer<typeof zRecord>
export const zRecord = z.object({
	id: z.number().nullish(),
	patientId: z.number(),
	// type: z.string().min(1, 'Type is required!'),
	text: z.string().min(1, 'Text is required!'),
	date: z.string().min(1, 'Date is required!'),
	amount: z.number().default(0),
	tags: z.array(z.string()).default([]),
	attachments: z.array(z.any()).default([]),
})

export const recordTypes = ['Visit', 'Investigation', 'Medicine', 'Other'].map(
	type => ({
		label: type,
		value: type,
	}),
)

export const useRecordsStorage = () => {
	return useMMKVArray<TRecord>(`records`, {
		getKey: item => item.id,
	})
}

export const useRecords = ({ patientId }: { patientId?: number } = {}) => {
	const { data: records } = useRecordsStorage()

	const data = useMemo(() => {
		return (
			patientId
				? records.filter(record => {
						return record.patientId === patientId
					})
				: records
		).sort((a, b) => {
			return new Date(b.date).getTime() - new Date(a.date).getTime()
		})
	}, [records, patientId])

	return { data }
}

export const useRecordsActions = () => {
	const { push, update, getByKey } = useRecordsStorage()

	const submit = useCallback(
		async (id: TMaybe<number>, item: TZRecord) => {
			const existingRecord = getByKey(id)
			if (id && !existingRecord) {
				Alert.alert('Error', 'Record not found')
				return
			}
			if (id) {
				const removedAttachments = existingRecord?.attachments?.filter(
					attachment => {
						return !item.attachments?.some(a => {
							return a?.uri === attachment?.uri
						})
					},
				)
				if (removedAttachments) {
					for (const attachment of removedAttachments) {
						if (attachment?.uri) {
							fs.remove(attachment.uri)
						}
					}
				}
			}
			item.attachments = item.attachments?.map(attachment => {
				if (attachment?.uri) {
					const { data } = fs.copyAssetTo('files', attachment)
					if (data) attachment.uri = data.uri
					return attachment
				}
				return attachment
			})
			if (id) {
				return update({
					...item,
					id,
					updatedAt: new Date().toISOString(),
				})
			}
			push({
				...item,
				id: Date.now(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
		},
		[push, update, getByKey],
	)

	return { submit }
}

export const useRecordById = (id: number) => {
	const { remove: removeData, getByKey } = useRecordsStorage()
	const data = useMemo(() => getByKey(id), [id, getByKey])

	const remove = useCallback(async () => {
		for (const attachment of data?.attachments ?? []) {
			if (attachment?.uri) {
				fs.remove(attachment.uri)
			}
		}
		removeData(data?.id)
	}, [data, removeData])

	return { data, remove }
}
