import { useGlobalSearchParams } from 'expo-router'

const first = (value?: string | string[]) => {
	if (Array.isArray(value)) return value[0]
	return value
}

/** Patient `[id]` from the URL — use this under nested patient tabs/forms. */
export const usePatientIdParam = () => {
	const params = useGlobalSearchParams<{ id?: string | string[] }>()
	const id = first(params.id)
	const patientId = Number(id)
	return {
		id,
		patientId,
		isValid: Number.isFinite(patientId) && patientId > 0,
	}
}
