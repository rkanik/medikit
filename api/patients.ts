import { useMMKVNumber } from 'react-native-mmkv'
import { z } from 'zod'
import { usePatientByIdQuery } from '@/queries/usePatientByIdQuery'

export type TZPatient = z.infer<typeof zPatient>
export const zPatient = z.object({
	id: z.number().nullish(),
	dob: z.string().nullish(),
	dod: z.string().nullish(),
	gender: z.string().nullish(),
	public: z.boolean().default(true),
	name: z.string().min(1, 'Name is required!'),
	avatar: z.any(),
})

export const useCurrentPatientIdStorage = () => {
	return useMMKVNumber('currentPatientId')
}

export const useCurrentPatient = () => {
	const [id, setData] = useCurrentPatientIdStorage()
	const { data } = usePatientByIdQuery(Number(id))
	return {
		data,
		setData,
	}
}
