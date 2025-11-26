import { useMMKVArray } from '@/hooks/useMMKVArray'
import { TMaybe } from '@/types'
import { TRecord } from '@/types/database'
import { fs } from '@/utils/fs'
import { useCallback, useMemo } from 'react'
import { Alert } from 'react-native'
import { patients } from './patients'

const useRecordsStorage = () => {
	return useMMKVArray<TRecord>(`records`, {
		getKey: item => item.id,
	})
}

const useRecords = () => {
	const { data: records } = useRecordsStorage()
	const { data: patient } = patients.useCurrentPatient()

	const data = useMemo(() => {
		return records.filter(record => {
			return record.patientId === patient?.id
		})
	}, [records, patient])

	return { data }
}

const useRecordsActions = () => {
	const { push, update, getByKey } = useRecordsStorage()
	const { data: patient } = patients.useCurrentPatient()

	const submit = useCallback(
		async (id: TMaybe<number>, item: Omit<TRecord, 'id' | 'patientId'>) => {
			if (!patient) {
				Alert.alert('Error', 'Please select a patient first')
				return
			}
			if (id) {
				const existingRecord = getByKey(id)
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
					const { data } = fs.copyAssetTo('attachments', attachment)
					if (data) attachment.uri = data.uri
					return attachment
				}
				return attachment
			})
			if (id) {
				return update({
					id,
					...item,
					patientId: patient.id,
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
	const { remove: removeItem, getByKey } = useRecordsStorage()
	const data = useMemo(() => getByKey(id), [id, getByKey])

	const remove = useCallback(async () => {
		for (const attachment of data?.attachments ?? []) {
			if (attachment?.uri) {
				fs.remove(attachment.uri)
			}
		}
		removeItem(data?.id)
	}, [data, removeItem])

	return { data, remove }
}

export const records = {
	useRecords,
	useRecordById,
	useRecordsActions,
}
