import { useMemo } from 'react'
import { mapPatient } from '@/queries/mapPatient'
import { usePatientsQuery } from '@/queries/usePatientsQuery'

export const usePatientsListQuery = () => {
	const query = usePatientsQuery({
		page: 1,
		perPage: 500,
	})

	const data = useMemo(() => {
		return (query.data?.pages ?? [])
			.flatMap(page => page.data ?? [])
			.map(patient => mapPatient(patient)!)
	}, [query.data?.pages])

	return {
		...query,
		data,
	}
}
