import { useMMKVArray } from '@/hooks/useMMKVArray'
import { TMaybe } from '@/types'
import { TPatient } from '@/types/database'
import { fs } from '@/utils/fs'
import { createFile } from '@/utils/storage'
import { useCallback, useMemo } from 'react'
import { useMMKVNumber } from 'react-native-mmkv'
import { z } from 'zod'
import { GoogleDrive } from './drive'

export type TZPatient = z.infer<typeof zPatient>
const zPatient = z.object({
	id: z.number().nullable(),
	dob: z.string().nullable(),
	name: z.string().min(1, 'Name is required!'),
	avatar: z.any(),
})

const createJsonFile = () => {
	const base = fs.getDirectory().uri
	return createFile<TPatient>({
		name: 'patients',
		overwrite: true,
		map: item => ({
			...item,
			avatar: (item.avatar?.uri || '').replace(base, ''),
		}),
	})
}

const usePatientsStorage = () => {
	return useMMKVArray<TPatient>(`patients`, {
		getKey: item => item.id,
	})
}

const useCurrentPatientIdStorage = () => {
	return useMMKVNumber('currentPatientId')
}

const useCurrentPatient = () => {
	const { data: items } = usePatientsStorage()
	const [currentPatientId, setData] = useCurrentPatientIdStorage()
	const data = useMemo<TMaybe<TPatient>>(() => {
		return (
			items.find(item => {
				return item.id === currentPatientId
			}) || items[0]
		)
	}, [items, currentPatientId])
	return {
		data,
		setData,
	}
}

const usePatients = () => {
	const { data } = usePatientsStorage()
	return { data }
}

const usePatientsActions = () => {
	const { push, update, getByKey } = usePatientsStorage()

	const submit = useCallback(
		async (id: TMaybe<number>, item: TZPatient) => {
			const drive = new GoogleDrive()
			if (id) {
				const ePatient = getByKey(id)
				if (
					ePatient?.avatar?.uri &&
					ePatient?.avatar?.uri !== item.avatar?.uri
				) {
					fs.remove(ePatient.avatar.uri)
					drive.findAndDelete({
						names: [ePatient.avatar.uri.split('/').pop()!],
					})
				}
			}

			if (item.avatar?.uri) {
				const { data } = fs.copyAssetTo('avatars', item.avatar)
				if (data) {
					item.avatar = data
					drive.upload([{ ...data, folder: 'avatars' }])
				}
			}

			if (id) {
				update({
					...item,
					id,
					updatedAt: new Date().toISOString(),
				})
			} else {
				push({
					...item,
					id: Date.now(),
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})
			}

			const file = createJsonFile()
			if (file) drive.upload([file])
		},
		[push, update, getByKey],
	)

	return {
		submit,
	}
}

const usePatientById = (id: number) => {
	const { remove: removeItem, getByKey } = usePatientsStorage()
	const data = useMemo(() => getByKey(id), [id, getByKey])

	const remove = useCallback(async () => {
		const drive = new GoogleDrive()
		if (data?.avatar?.uri) {
			fs.remove(data.avatar.uri)
			drive.findAndDelete({
				names: [data.avatar.uri.split('/').pop()!],
			})
		}
		removeItem(data?.id)
		const file = createJsonFile()
		if (file) drive.upload([file])
	}, [data, removeItem])

	return { data, remove }
}

export const patients = {
	zPatient,
	usePatients,
	usePatientById,
	useCurrentPatient,
	usePatientsActions,
	createJsonFile,
}
