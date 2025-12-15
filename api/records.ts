import { useMMKVArray } from '@/hooks/useMMKVArray'
import { TMaybe } from '@/types'
import { TRecord } from '@/types/database'
import { fs } from '@/utils/fs'
import { useCallback, useMemo } from 'react'
import { Alert } from 'react-native'
import { z } from 'zod'
import { useCurrentPatient } from './patients'

export type TZRecord = z.infer<typeof zRecord>
const zRecord = z.object({
	id: z.number().nullish(),
	type: z.string().min(1, 'Type is required!'),
	text: z.string().min(1, 'Text is required!'),
	date: z.string().min(1, 'Date is required!'),
	amount: z.number().default(0),
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

const useRecordsActions = () => {
	const { push, update, getByKey } = useRecordsStorage()
	const { data: patient } = useCurrentPatient()

	const submit = useCallback(
		async (id: TMaybe<number>, item: TZRecord) => {
			if (!patient) {
				Alert.alert('Error', 'Please select a patient first')
				return
			}

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
				patientId: patient.id,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
		},
		[patient, push, update, getByKey],
	)

	return { submit }
}

const useRecordById = (id: number) => {
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

export const records = {
	types: recordTypes,
	zRecord,
	useRecords,
	useRecordById,
	useRecordsActions,
}
